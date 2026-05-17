import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import addressesRouter from "./addresses";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(addressesRouter);

export default router;
