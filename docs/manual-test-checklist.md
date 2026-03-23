# Manual Test Checklist

## 1. Wishlist flow

- Login with a normal user account on mobile.
- Open Home and tap the heart icon on at least 2 products.
- Open Wishlist from Profile and confirm both products appear.
- Pull down to refresh Wishlist and confirm data still matches the server.
- Tap heart again from Product Detail or product card and confirm the item is removed from Wishlist.

## 2. Review flow

- Open a product detail page while logged in.
- Select a star rating and enter a short comment.
- Submit the review and confirm success message appears.
- Confirm the review list updates immediately with your name, rating, and comment.
- Submit a second review on the same product with a different score and confirm it updates the old review instead of creating a duplicate.

## 3. Variant stock flow

- In admin, create or edit a product with multiple variant lines using `size|color|stock`.
- Save and confirm total stock in the admin table matches the sum of variants.
- On mobile, open that product and switch size/color combinations.
- Confirm available stock changes according to the selected variant.
- Add quantity near the limit to cart, then try exceeding stock and confirm the app blocks over-ordering.
- Create an order for one variant and confirm stock decreases correctly after checkout.
- Cancel a pending order and confirm stock is restored for the exact variant.

## 4. Voucher flow

- In admin, create one `PERCENT` voucher and one `FIXED` voucher.
- Confirm both vouchers appear in the voucher list with correct status and rules.
- Toggle one voucher inactive and confirm checkout rejects it.
- At mobile checkout, enter an active voucher with subtotal below `minOrderValue` and confirm the API returns an error.
- Increase cart subtotal above the threshold and apply the voucher again.
- Confirm discount amount, final total, and saved `voucherCode` on the created order are correct.

## 5. Admin regression checks

- Open Orders admin and confirm status dropdown still follows allowed transition rules.
- Open Products admin and confirm create/edit still works for products without variants.
- Open Categories admin and confirm duplicate names are rejected.
- Refresh admin after logging in again and confirm voucher list still loads through authenticated API.
