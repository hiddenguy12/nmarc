/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { Request, Response, Router } from "express";
import { readFileSync } from "fs";
import path from "path";
import { validateVideoProfile } from "../lib/middlewares/auth.middleware";
import { z, ZodError } from "zod";
import giveCoinPackageDetails from "../controllers/coins.controller";
import PaypalPayment from "../config/paypal";
import { BASE_URL, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAP_CURRENCY, STRIPE_CURRENCY, STRIPE_SECRET_KEY } from "../config/env";
import CoinsTransection from "../models/CoinsTransection";
import StripePay from "../config/stripe";
import VideoProfile from "../models/VideoProfile";
import { AnyArray } from "mongoose";

const router = Router();

let transectionIdValidation = z.string().min(1).max(512).refine(
  str => !/<script.*?>.*?<\/script>/gi.test(str),
  { message: "Scripts not allowed" }
)
  .refine(
    str => !/\$|\{|\}|\b(?:\$ne|\$gt|\$lt|\$or|\$where)\b/gi.test(str),
    { message: "Possible injection detected" }
  )
  .refine(
    str => /^[\x00-\x7F]*$/.test(str), // ASCII filter (optional)
    { message: "Unsupported characters" }
  );


router.post('/buy-coins/paypal',validateVideoProfile, async function (req: Request, res: Response): Promise<any> {
  try {
    let packageIdValidation = z.enum(['package_1', 'package_2', 'package_3', 'package_4']);
    let package_id = packageIdValidation.parse(req.body.package_id);
    let { name, price } = giveCoinPackageDetails(package_id);

    let paypal = new PaypalPayment({
      client_id: PAYPAL_CLIENT_ID as string,
      client_secret: PAYPAL_CLIENT_SECRET as string,
      success_url: BASE_URL + '/api/coins/payment-success/paypal',
      cancel_url: BASE_URL + '/api/coins/payment-cancel/paypal',
      brand_name: 'NMRCA'
    });

    let pAccessToken = await paypal.getAccessToken();

    let paymentInfo = await paypal.createPayment({
      accessToken: pAccessToken,
      items: [
        {
          name: `FriendBook Coins ${name} Package`,
          unit_amount: {
            currency_code: PAYPAP_CURRENCY as string,
            value: Number(price).toFixed()
          },
          quantity: 1
        }],
      total: Number(price).toFixed(),
      productToatal: Number(price).toFixed(),
      shipping: '0.00',
      success_url: BASE_URL + '/api/coins/payment-success/paypal',
      cancel_url: BASE_URL + '/api/coins/payment-cancel/paypal'
    });

    if (!paymentInfo.link || !paymentInfo.token) {
      throw new Error('Failed to make Paypal Payment')
    }

    let transection = new CoinsTransection({
      userId: req.videoProfile._id,
      amount: price,
      paymentMethod: 'paypal',
      transactionId: paymentInfo.token,
      package: package_id,
      status: "pending"
    })

    await transection.save()

    res.status(200).json({
      success: true,
      data: {
        link: paymentInfo.link
      },
  
      message: 'Paypal Coin Purchase Link created '
    })
    return;
  } catch (error) {

    if (error instanceof ZodError) {
      res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          error: error.errors,
          data: null
      });
      return;
    }
    console.error('[Buy Coins Paypal Api Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});


router.post('/buy-coins/stripe',validateVideoProfile, async function (req: Request, res: Response): Promise<any> {
  try {

    let packageIdValidation = z.enum(['package_1', 'package_2', 'package_3', 'package_4']);
    let package_id = packageIdValidation.parse(req.body.package_id);
    let { name, price } = giveCoinPackageDetails(package_id);

    let stripe = new StripePay({
      key: STRIPE_SECRET_KEY as string,
      success_url: BASE_URL + '/api/coins/payment-success/stripe' + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: BASE_URL + '/api/coins/payment-cancel/stripe' + '?session_id={CHECKOUT_SESSION_ID}',
    });

    let paymentInfo = await stripe.checkOut({
      shipping_amount: 0,
      line_items: [
        {
          price_data: {
            currency: STRIPE_CURRENCY as string,
            product_data: {
              name: `FriendBook Coins ${name} Package` ,
            },
            unit_amount: Number(price )* 100,
          },
          quantity: 1
        }
      ]
    });

    let transection = new CoinsTransection({
      userId: req.videoProfile._id,
      amount: price,
      paymentMethod: 'stripe',
      transactionId: paymentInfo.id,
      package: package_id,
      status: "pending"
    })

    await transection.save();


    res.status(200).json({
      success: true,
      data: {
        link: paymentInfo.url
      },
  
      message: 'Paypal Coin Purchase Link created '
    })
    return;

  } catch (error) {
    console.error('[Buy Coins Paypal Api Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

router.get('/payment-success/paypal', async function (req: Request, res: Response): Promise<any> {
  try {
    // Extract the PayPal transaction token from the query parameters
    const token =transectionIdValidation.parse( req.query.token as string);
  
    // Find the transaction in our database
    const transaction = await CoinsTransection.findOne({
      transactionId: token,
      paymentMethod: 'paypal',
      status: 'pending'
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        data: null
      });
    }

    // Create PayPal instance for verification
    const paypal = new PaypalPayment({
      client_id: PAYPAL_CLIENT_ID as string,
      client_secret: PAYPAL_CLIENT_SECRET as string,
      success_url: BASE_URL + '/api/coins/payment-success/paypal',
      cancel_url: BASE_URL + '/api/coins/payment-cancel/paypal',
      brand_name: 'NMRCA'
    });

    // Verify the payment with PayPal
    const accessToken = await paypal.getAccessToken();
    const paymentDetails :any= await paypal.captureDetails(token);
    
    if (paymentDetails.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: null
      });
    }

   
    // Update user's coin balance based on the package
    const { coins } = giveCoinPackageDetails(transaction.package);
    
     // Update transaction status
    transaction.status = 'success';
    transaction.updatedAt = new Date();
    transaction.coins = Number(coins);
    await transaction.save();


    let vUser =await VideoProfile.findByIdAndUpdate(
      transaction.userId,
      { $inc: { video_calling_coins: Number(coins) } }
    );


    if (vUser?.socket_ids.notification_socket) req.notifications?.io.to(vUser?.socket_ids.notification_socket).emit('coin-purchase-notification', { coins, status: 'success' });


    // Redirect to success page or return success response
    return res.redirect(`${BASE_URL}/purchase_status?type=paypal&id=${transaction._id}&status=success`);
  } catch (error) {
      if (error instanceof ZodError) {
      res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          error: error.errors,
          data: null
      });
      return;
    }
    console.error('[Payment Success Paypal Api error]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

router.get('/payment-success/stripe', async function (req: Request, res: Response): Promise<any> {
  try {
    
    const sessionId =transectionIdValidation.parse(  req.query.session_id as string);
  

    const stripe = new StripePay({
      key: STRIPE_SECRET_KEY as string,
      success_url: BASE_URL + '/api/coins/payment-success/stripe' + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: BASE_URL + '/api/coins/payment-cancel/stripe' + '?session_id={CHECKOUT_SESSION_ID}',
    });

    const session = await stripe.retrieveSession(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: null
      });
    }

    const transaction = await CoinsTransection.findOne({
      transactionId: sessionId,
      paymentMethod: 'stripe',
      status: 'pending'
    })

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        data: null
      });
    }

   

    const { coins } = giveCoinPackageDetails(transaction.package);
    

    transaction.status = 'success';
    transaction.updatedAt = new Date();
    transaction.coins = Number(coins);
    await transaction.save();


    let vUser =await VideoProfile.findByIdAndUpdate(
      transaction.userId,
      { $inc: { video_calling_coins: Number(coins) } }
    );

    if (vUser?.socket_ids.notification_socket) req.notifications?.io.to(vUser?.socket_ids.notification_socket).emit('coin-purchase-notification', { coins, status: 'success' });

    // Redirect to success page or return success response
    return res.redirect(`${BASE_URL}/purchase_status?type=stripe&id=${transaction._id}&status=success`);
  } catch (error) {
      if (error instanceof ZodError) {
      res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          error: error.errors,
          data: null
      });
      return;
    }
    console.error('[Payment Success Stripe Api error]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

router.get('/payment-cancel/paypal', async function (req: Request, res: Response): Promise<any> {
  try {

    const token =transectionIdValidation.parse( req.query.token as string);
  
    // Find the transaction in our database
    const transaction :any = await CoinsTransection.findOne({
      transactionId: token,
      paymentMethod: 'paypal',
      status: 'pending',
      
    } ).populate('userId');



    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        data: null
      });
    }

    // Update transaction status
    transaction.status = 'failed';
    transaction.updatedAt = new Date();
    await transaction.save();

    const { coins } = giveCoinPackageDetails(transaction.package);

    let vUser = await transaction.userId;
    if (vUser?.socket_ids.notification_socket) req.notifications?.io.to(vUser?.socket_ids.notification_socket).emit('coin-purchase-notification', { coins, status: 'failed' });

    // Redirect to cancel page or return cancel response
    return res.redirect(`${BASE_URL}/purchase_status?type=paypal&id=${transaction._id}&status=failed`);
  } catch (error) {
     if (error instanceof ZodError) {
      res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          error: error.errors,
          data: null
      });
      return;
    }
    console.error('[Payment Cancel Paypal Api error]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

router.get('/payment-cancel/stripe', async function (req: Request, res: Response): Promise<any> {
  try {
    // Extract the Stripe session ID from the query parameters
      const sessionId =transectionIdValidation.parse(  req.query.session_id as string);

    // Find the transaction in our database
    const transaction :any= await CoinsTransection.findOne({
      transactionId: sessionId,
      paymentMethod: 'stripe',
      status: 'pending'
    }).populate('userId');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        data: null
      });
    }


    // Update transaction status
    transaction.status = 'failed';
    transaction.updatedAt = new Date();
    await transaction.save();


    const { coins } = giveCoinPackageDetails(transaction.package);

    let vUser = await transaction.userId;
    if (vUser?.socket_ids.notification_socket) req.notifications?.io.to(vUser?.socket_ids.notification_socket).emit('coin-purchase-notification', { coins, status: 'failed' });

    // Redirect to cancel page or return cancel response
    return res.redirect(`${BASE_URL}/purchase_status?type=stripe&id=${transaction._id}&status=failed`);
  } catch (error) {
      if (error instanceof ZodError) {
      res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          error: error.errors,
          data: null
      });
      return;
    }
    console.error('[Payment Cancel Stripe Api error]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

router.get('/coin-purchase-history',validateVideoProfile , async function (req: Request, res: Response): Promise<any> {
  try {
    let transactions = await CoinsTransection.aggregate([
      {
        $match : {  userId: req.videoProfile._id,  }
      },
      {
        $sort : {createdAt: -1 }
      },
      {
        $project : {
          amount : 1,
          package : 1,
          paymentMethod : 1,
          coins : 1,
          transactionDate : '$createdAt',
          status : 1,
          admin_note : 1
        }
      }
    ]);


    res.status(200).json({
      success: true,
      data: {   transactions},
      error: null,
      message: 'OK'
    })
    return;
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

router.post('/coin-purchase-request', validateVideoProfile, async function (req: Request, res: Response): Promise<any> {
  try {
    let { package_id, paymentMethod, transactionId, amount, paying_phone_number } = (z.object({
      paymentMethod: z.enum(['bkash', 'nagad', 'rocket']),
      transactionId: z.string().trim().min(1).max(120),
      amount: z.number().max(100000),
      package_id: z.enum(['package_1', 'package_2', 'package_3', 'package_4']),
      paying_phone_number: z.string()
    })).parse(req.body);

    await CoinsTransection.create({
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      amount,
      currency : 'BDT',
      package: package_id,
      userId: req.videoProfile?._id,
      paying_phone_number
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error('[Coin Purchase Request Api]', error);
    if (error instanceof ZodError) {
      res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          error: error.errors,
          data: null
      });
      return;
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});



export default router;