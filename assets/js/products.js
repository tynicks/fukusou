/* ============================================================
   FUKUSOU — PRODUCT LIST
   Every item below is a PLACEHOLDER until real photos arrive.
   To add a real product photo:
     1. drop the image into  assets/products/
     2. set  img: "assets/products/your-file.jpg"
        (and optionally imgBack for the hover / back view)
     3. set  placeholder: false
   SHOPIFY CHECKOUT (store: fukusouonline.myshopify.com)
   Each real product gets  shopify: { variants: { S: 1234567890, M: ... } }
   = the Shopify variant ID for every size. When every item in the cart
   has one, CHECKOUT sends the cart straight to Shopify's checkout.
   ============================================================ */
window.FUKUSOU_PRODUCTS = [
  /* REAL PRODUCT (name still to confirm). price: null would show "PRICE TBD" */
  { id: 13, name: "PLAID HOODED ZIP JACKET", cat: "outerwear", shape: "hoodie", price: 500, colorway: "BLACK / TAN PLAID", drop: "001", soldOut: false, placeholder: false, img: "assets/products/jacket-front.webp", imgBack: "assets/products/jacket-back.webp",
    // fill in once the jacket exists in Shopify (null = not linked yet)
    shopify: { variants: { S: null, M: null, L: null, XL: null, XXL: null } } },
  { id: 1,  name: "初 TEE",            cat: "tees",    shape: "tee",       price: 55,  colorway: "BLACK",        drop: "001", soldOut: false, placeholder: true, img: null, imgBack: null },
  { id: 2,  name: "SEAL HOODIE",       cat: "hoodies", shape: "hoodie",    price: 120, colorway: "WASHED BLACK", drop: "001", soldOut: false, placeholder: true, img: null, imgBack: null },
  { id: 3,  name: "STAMP L/S",         cat: "tees",    shape: "longsleeve",price: 70,  colorway: "BONE",         drop: "001", soldOut: false, placeholder: true, img: null, imgBack: null },
  { id: 4,  name: "CUT CARGO",         cat: "bottoms", shape: "pants",     price: 110, colorway: "CONCRETE",     drop: "001", soldOut: false, placeholder: true, img: null, imgBack: null },
  { id: 5,  name: "BLOCK TEE",         cat: "tees",    shape: "tee",       price: 55,  colorway: "WHITE",        drop: "001", soldOut: true,  placeholder: true, img: null, imgBack: null },
  { id: 6,  name: "DIVISION ZIP",      cat: "hoodies", shape: "hoodie",    price: 135, colorway: "RED",          drop: "001", soldOut: false, placeholder: true, img: null, imgBack: null },
  { id: 7,  name: "HANKO CAP",         cat: "headwear",shape: "cap",       price: 45,  colorway: "BLACK / RED",  drop: "001", soldOut: false, placeholder: true, img: null, imgBack: null },
  { id: 8,  name: "RAW TOTE",          cat: "accessories", shape: "tote",  price: 35,  colorway: "NATURAL",      drop: "001", soldOut: false, placeholder: true, img: null, imgBack: null },
  { id: 9,  name: "NOISE TEE",         cat: "tees",    shape: "tee",       price: 55,  colorway: "ASH",          drop: "001", soldOut: false, placeholder: true, img: null, imgBack: null },
  { id: 10, name: "WIDE PANT",         cat: "bottoms", shape: "pants",     price: 95,  colorway: "BLACK",        drop: "001", soldOut: true,  placeholder: true, img: null, imgBack: null },
  { id: 11, name: "MARK CAP",          cat: "headwear",shape: "cap",       price: 45,  colorway: "BONE",         drop: "001", soldOut: false, placeholder: true, img: null, imgBack: null },
  { id: 12, name: "SEAL L/S",          cat: "tees",    shape: "longsleeve",price: 70,  colorway: "BLACK",        drop: "001", soldOut: false, placeholder: true, img: null, imgBack: null }
];
