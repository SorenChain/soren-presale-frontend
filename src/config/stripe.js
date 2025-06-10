import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(process.env.REACT_APP_stripeKey ||"pk_test_51RJXDxQo4TM0bSf5c4hXA8D7iJoJF51OU64yw86gpBQUsYGbMoEYM2Ndt5AV5tyt2PzQfJP01EILx9ENOQoxsmb700kbC9x75u");
