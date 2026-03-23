const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000/api';

const assertOk = async (response, label) => {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${label} failed: ${JSON.stringify(payload)}`);
  }
  return payload;
};

const registerUser = async (email, name, phone) => {
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      password: '123456',
      phone,
      address: 'Full checkout test address',
    }),
  });

  return assertOk(response, `register ${email}`);
};

const run = async () => {
  const uniqueSuffix = Date.now();
  const voucherCode = `FUL${String(uniqueSuffix).slice(-6)}`;

  const adminLoginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@fashion.com', password: '123456' }),
  });
  const adminLogin = await assertOk(adminLoginResponse, 'admin login');
  const adminToken = adminLogin.data.token;

  const createVoucherResponse = await fetch(`${baseUrl}/vouchers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      code: voucherCode,
      type: 'FIXED',
      value: 25000,
      minOrderValue: 100000,
      maxDiscount: 0,
      isActive: true,
    }),
  });
  const createdVoucher = await assertOk(createVoucherResponse, 'create voucher');

  const productsResponse = await fetch(`${baseUrl}/products`);
  const products = await assertOk(productsResponse, 'load products');
  const product = (products.data || []).find((item) => Number(item.stock || 0) > 3);
  if (!product) {
    throw new Error('no suitable in-stock product found for full checkout test');
  }

  const unitPrice = Number(product.salePrice || product.price || 0);
  const quantity = Math.max(1, Math.ceil(120000 / Math.max(unitPrice, 1)));

  for (let index = 0; index < 3; index += 1) {
    const registered = await registerUser(
      `prearchive_${index}_${uniqueSuffix}@test.com`,
      `Pre Archive ${index}`,
      `0966600${String(index).padStart(3, '0')}`,
    );

    const orderResponse = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${registered.data.token}`,
      },
      body: JSON.stringify({
        items: [
          {
            productId: product._id,
            quantity,
            size: (product.sizes && product.sizes[0]) || '',
            color: (product.colors && product.colors[0]) || '',
          },
        ],
        shippingAddress: 'Full checkout test address',
        phone: `0966600${String(index).padStart(3, '0')}`,
        paymentMethod: 'COD',
        voucherCode,
      }),
    });

    await assertOk(orderResponse, `pre-archive order ${index}`);
  }

  const archiveResponse = await fetch(`${baseUrl}/vouchers/${createdVoucher.data._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const archivePayload = await assertOk(archiveResponse, 'archive voucher');

  const restoreActivateResponse = await fetch(`${baseUrl}/vouchers/${createdVoucher.data._id}/restore`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ activate: true }),
  });
  const restoredVoucher = await assertOk(restoreActivateResponse, 'restore and activate');

  const checkoutUser = await registerUser(
    `checkout_${uniqueSuffix}@test.com`,
    'Checkout User',
    '0966699999',
  );

  const checkoutOrderResponse = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${checkoutUser.data.token}`,
    },
    body: JSON.stringify({
      items: [
        {
          productId: product._id,
          quantity,
          size: (product.sizes && product.sizes[0]) || '',
          color: (product.colors && product.colors[0]) || '',
        },
      ],
      shippingAddress: 'Full checkout test address',
      phone: '0966699999',
      paymentMethod: 'COD',
      voucherCode,
    }),
  });
  const checkoutOrder = await assertOk(checkoutOrderResponse, 'checkout order after restore');

  console.log(
    JSON.stringify(
      {
        voucherCode,
        archiveMode: archivePayload.data?.mode,
        restoredIsActive: restoredVoucher.data?.isActive,
        finalOrderVoucherCode: checkoutOrder.data?.voucherCode,
        finalOrderDiscountAmount: checkoutOrder.data?.discountAmount,
        finalOrderTotal: checkoutOrder.data?.totalAmount,
      },
      null,
      2,
    ),
  );
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});