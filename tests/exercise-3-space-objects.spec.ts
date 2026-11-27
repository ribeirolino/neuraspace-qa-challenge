import { test, expect } from '@playwright/test'

const URL = 'https://neuraspacedummyrsoapiappservicelinux-hyayfbdrg3gea6fd.westeurope-01.azurewebsites.net/space_objects'

const validPayload = () => ({
  "cosparId": "1990-067T",
  "noradId": "30948",
  "name": "Test Satellite",
  "objectType": "Payload",
  "launchCountry": "PT",
  "launchDate": "2023-12-08",
  "launchSite": "Kourou",
  "decay": "2024-06-15",
  "period": 90.5,
  "inclination": 51.6,
  "apogee": 500,
  "perigee": 450,
  "launchMass": 150.0,
  "dryMass": 120.0
})

test('Accept valid payload object and delete it', async ({ request }) => {
  try {
    const postResponse = await request.post(URL, { data: validPayload() });
    expect(postResponse.status()).toBe(200);
    const get = await request.get(`${URL}/cosparid`, {
      params: { cosparId: '1990-067T' },
    });
    expect(get.status()).toBe(200);
  } finally {
    const deleteResponse = await request.delete(`${URL}/cosparid`, {
      params: { cosparId: '1990-067T' },
    });
    expect(deleteResponse.status()).toBe(200)
  }
});

test('Delete a space object that does not exist in DB', async ({ request }) => {
  const deleteResponse = await request.delete(`${URL}/cosparid`, {
    params: { cosparId: '1012-093T' },
  });
  expect(deleteResponse.status()).toBe(404);
})

test('Get all space objects', async ({ request }) => {
  const get = await request.get(URL, {
    params: {
      pageIndex: 0,
      pageSize: 50,
    },
  });
  expect(get.status()).toBe(200);
})


test('Get a space objects count', async ({ request }) => {
  const get = await request.get(`${URL}/count`);
  expect(get.status()).toBe(200);
})

//What is the id? Should be internalId? Or not? Test is failling
test('Get a space object by id', async ({ request }) => {
  const get200 = await request.get(`${URL}/id`, {
    params: { id: '3d97dac8-305b-475b-9276-6f6ca2d34bd9' },
  });
  expect(get200.status()).toBe(200);

  const get404 = await request.get(`${URL}/id`, {
    params: { id: '444343435-5454544-545-545454' },
  });
  expect(get404.status()).toBe(404);
})

//What is the id? Should be internalId? Or not? Test is failling
test('Delete a space object by id', async ({ request }) => {
  const deleteResponse200 = await request.delete(`${URL}/id`, {
    params: { id: '3d97dac8-305b-475b-9276-6f6ca2d34bd9' },
  });
  expect(deleteResponse200.status()).toBe(200);

  const deleteResponse404 = await request.delete(`${URL}/id`, {
    params: { id: '444343435-5454544-545-545454' },
  });
  expect(deleteResponse404.status()).toBe(404);
})

test('Reject invalid launch date', async ({ request }) => {
  const newPayload = { ...validPayload(), launchDate: '26-11-1994' };
  const response = await request.post(URL, { data: newPayload });
  expect(response.status()).toBe(400);
})

test('Reject invalid decay', async ({ request }) => {
  const newPayload = { ...validPayload(), decay: '26-11-1994' };
  const response = await request.post(URL, { data: newPayload });
  expect(response.status()).toBe(400);
})

test('Reject invalid objectType format', async ({ request }) => {
  const newPayload = { ...validPayload(), objectType: 'Nothing' }
  const response = await request.post(URL, { data: newPayload });
  expect(response.status()).toBe(400);

});

//Test is failling because it was not supposed to accept this noradId
test('Reject invalid noradId format', async ({ request }) => {
  const newPayload = { ...validPayload(), noradId: '1234A' };
  const response = await request.post(URL, { data: newPayload });
  expect(response.status()).toBe(400);
})

test('Reject zero apogee', async ({ request }) => {
  const newPayload = { ...validPayload(), apogee: 0 };
  const response = await request.post(URL, { data: newPayload });
  expect(response.status()).toBe(400);
});

test('Reject zero period', async ({ request }) => {
  const newPayload = { ...validPayload(), period: 0 };
  const response = await request.post(URL, { data: newPayload });
  expect(response.status()).toBe(400);
});

test('Reject zero inclination', async ({ request }) => {
  const newPayload = { ...validPayload(), inclination: 0 };
  const response = await request.post(URL, { data: newPayload });
  expect(response.status()).toBe(400);
});

test('Reject zero Perigee', async ({ request }) => {
  const newPayload = { ...validPayload(), perigee: 0 };
  const response = await request.post(URL, { data: newPayload });
  expect(response.status()).toBe(400);
});

test('Reject zero Dry mass', async ({ request }) => {
  const newPayload = { ...validPayload(), dryMass: 0 };
  const response = await request.post(URL, { data: newPayload });
  expect(response.status()).toBe(400);
});

test('Reject zero launchMass', async ({ request }) => {
  const newPayload = { ...validPayload(), launchMass: 0 };
  const response = await request.post(URL, { data: newPayload });
  expect(response.status()).toBe(400);
});

test('Reject empty payload', async ({ request }) => {
  const response = await request.post(URL, { data: {} });
  expect(response.status()).toBe(400);

  await request.delete(`${URL}/cosparid`, {
    params: { cosparId: '1990-067T' },
  });
});

/*
I created these test cases based on the provided specification so that
inserting resources into the database follows the business rules.

Regarding the API itself, in my opinion it should also have PUT and PATCH endpoints 
in case a resource needs to be replaced completely or updated partially.


*/
