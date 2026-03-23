const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000/api';

const assertOk = async (response, label) => {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${label} failed: ${JSON.stringify(payload)}`);
  }
  return payload;
};

const assertFail = async (response, label) => {
  const payload = await response.json();
  if (response.ok) {
    throw new Error(`${label} unexpectedly succeeded: ${JSON.stringify(payload)}`);
  }
  return payload;
};

const registerUser = async (index, uniqueSuffix) => {
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Validation Test ${index}`,
      email: `validation_${index}_${uniqueSuffix}@test.com`,
      password: '123456',
      phone: `0977700${String(index).padStart(3, '0')}`,
      address: 'Validation script address',
    }),
  });

  return assertOk(response, `register validation user ${index}`);
};

const run = async () => {
  const uniqueSuffix = Date.now();
  const voucherCode = `VAL${String(uniqueSuffix).slice(-6)}`;

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
      type: 'PERCENT',
      value: 10,
      minOrderValue: 100000,
      maxDiscount: 50000,
      isActive: true,
    }),
  });
  const createdVoucher = await assertOk(createVoucherResponse, 'create voucher');

  const productsResponse = await fetch(`${baseUrl}/products`);
  const products = await assertOk(productsResponse, 'load products');
  const product = (products.data || []).find((item) => Number(item.stock || 0) > 0);
  if (!product) {
    throw new Error('no in-stock product found for validation test');
  }

  const unitPrice = Number(product.salePrice || product.price || 0);
  const quantity = Math.max(1, Math.ceil(120000 / Math.max(unitPrice, 1)));
  const subtotal = unitPrice * quantity;

  for (let index = 0; index < 3; index += 1) {
    const registered = await registerUser(index, uniqueSuffix);
    const userToken = registered.data.token;

    const orderResponse = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
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
        shippingAddress: 'Validation script address',
        phone: `0977700${String(index).padStart(3, '0')}`,
        paymentMethod: 'COD',
        voucherCode,
      }),
    });

    await assertOk(orderResponse, `create validation order ${index}`);
  }

  const archiveResponse = await fetch(`${baseUrl}/vouchers/${createdVoucher.data._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const archivePayload = await assertOk(archiveResponse, 'archive voucher');

  const archivedValidateResponse = await fetch(`${baseUrl}/vouchers/validate/${voucherCode}?subtotal=${subtotal}`);
  const archivedValidatePayload = await assertFail(archivedValidateResponse, 'validate archived voucher');

  const restoreActivateResponse = await fetch(`${baseUrl}/vouchers/${createdVoucher.data._id}/restore`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ activate: true }),
  });
  const restoredVoucher = await assertOk(restoreActivateResponse, 'restore and activate voucher');

  const restoredValidateResponse = await fetch(`${baseUrl}/vouchers/validate/${voucherCode}?subtotal=${subtotal}`);
  const restoredValidatePayload = await assertOk(restoredValidateResponse, 'validate restored voucher');

  console.log(
    JSON.stringify(
      {
        voucherCode,
        archiveMode: archivePayload.data?.mode,
        archivedValidateMessage: archivedValidatePayload.message,
        restoredIsActive: restoredVoucher.data?.isActive,
        restoredDiscountAmount: restoredValidatePayload.data?.discountAmount,
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