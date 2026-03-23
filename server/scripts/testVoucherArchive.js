const baseUrl = process.env.API_BASE_URL || "http://localhost:5000/api";

const assertOk = async (response, label) => {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${label} failed: ${JSON.stringify(payload)}`);
  }
  return payload;
};

const registerUser = async (index, uniqueSuffix) => {
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `Archive Test ${index}`,
      email: `archive_${index}_${uniqueSuffix}@test.com`,
      password: "123456",
      phone: `0987600${String(index).padStart(3, "0")}`,
      address: "Archive script address",
    }),
  });

  return assertOk(response, `register user ${index}`);
};

const run = async () => {
  const uniqueSuffix = Date.now();
  const voucherCode = `ARC${String(uniqueSuffix).slice(-6)}`;

  const adminLoginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@fashion.com", password: "123456" }),
  });
  const adminLogin = await assertOk(adminLoginResponse, "admin login");
  const adminToken = adminLogin.data.token;

  const createVoucherResponse = await fetch(`${baseUrl}/vouchers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      code: voucherCode,
      type: "FIXED",
      value: 20000,
      minOrderValue: 100000,
      maxDiscount: 0,
      isActive: true,
    }),
  });
  const createdVoucher = await assertOk(
    createVoucherResponse,
    "create voucher",
  );

  const productsResponse = await fetch(`${baseUrl}/products`);
  const products = await assertOk(productsResponse, "load products");
  const product = (products.data || []).find(
    (item) => Number(item.stock || 0) > 0,
  );
  if (!product) {
    throw new Error("no in-stock product found for archive test");
  }

  const unitPrice = Number(product.salePrice || product.price || 0);
  const quantity = Math.max(1, Math.ceil(120000 / Math.max(unitPrice, 1)));

  for (let index = 0; index < 3; index += 1) {
    const registered = await registerUser(index, uniqueSuffix);
    const userToken = registered.data.token;

    const orderResponse = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            productId: product._id,
            quantity,
            size: (product.sizes && product.sizes[0]) || "",
            color: (product.colors && product.colors[0]) || "",
          },
        ],
        shippingAddress: "Archive script address",
        phone: `0987600${String(index).padStart(3, "0")}`,
        paymentMethod: "COD",
        voucherCode,
      }),
    });

    await assertOk(orderResponse, `create order ${index}`);
  }

  const deleteResponse = await fetch(
    `${baseUrl}/vouchers/${createdVoucher.data._id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    },
  );
  const deletedVoucher = await assertOk(deleteResponse, "archive voucher");

  const archivedListResponse = await fetch(`${baseUrl}/vouchers/archived`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const archivedList = await assertOk(
    archivedListResponse,
    "list archived vouchers",
  );
  const archivedVoucher = (archivedList.data || []).find(
    (item) => item.code === voucherCode,
  );
  if (!archivedVoucher) {
    throw new Error("archived voucher not found in archived list");
  }

  const restoreResponse = await fetch(
    `${baseUrl}/vouchers/${createdVoucher.data._id}/restore`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
    },
  );
  const restoredVoucher = await assertOk(restoreResponse, "restore voucher");

  const activeListResponse = await fetch(`${baseUrl}/vouchers`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const activeList = await assertOk(activeListResponse, "list active vouchers");
  const activeVoucher = (activeList.data || []).find(
    (item) => item.code === voucherCode,
  );
  if (!activeVoucher) {
    throw new Error("restored voucher not found in active list");
  }

  console.log(
    JSON.stringify(
      {
        voucherCode,
        archiveMode: deletedVoucher.data?.mode,
        archivedUsageCount: archivedVoucher.usageCount,
        restoredIsActive: restoredVoucher.data?.isActive,
        restoredArchivedAt: restoredVoucher.data?.archivedAt,
        visibleAgain: Boolean(activeVoucher),
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
