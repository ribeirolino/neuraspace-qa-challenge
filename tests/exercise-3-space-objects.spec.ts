import {test, expect} from '@playwright/test'

const URL = 'https://neuraspacedummyrsoapiappservicelinux-hyayfbdrg3gea6fd.westeurope-01.azurewebsites.net/space_objects'

const validPayload = () => ({
  "cosparId": "1990-LKLT",
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

test('Accept valid payload object', async ({request}) =>{
    const response = await request.post(URL, {data: validPayload ()});
    expect([200, 201]).toContain(response.status());
    
    const deleteResponse = await request.delete(`${URL}/${validPayload().cosparId}`);
    expect([200, 204]).toContain(deleteResponse.status());
});

test('Insert a duplicated space object in data base', async({request}) => {
    const response = await request.post(URL, {data: validPayload ()});
    expect([200, 201]).toContain(response.status());

    const secondResponse = await request.post(URL, {data: validPayload ()});
    expect([400, 409]).toContain(secondResponse.status());
})

test('Reject invalid launch date', async ({request}) => {
    const newPayload = {...validPayload(), launchDate:'26-11-1994'};
    const response = await request.post(URL, {data:newPayload});
    expect([400,422]).toContain(response.status());
})

test('Reject invalid decay', async ({request}) => {
    const newPayload = {...validPayload(), decay:'26-11-1994'};
    const response = await request.post(URL, {data:newPayload});
    expect([400,422]).toContain(response.status());
})

test('Reject invalid objectType format', async ({request}) => {
    const newPayload = {... validPayload(), objectType:'Nothing'}
    const response = await request.post(URL, {data:newPayload});
    expect([400,422]).toContain(response.status());
   
});

test('Reject invalid noradId format', async ({request}) => {
    const newPayload = {... validPayload(), noradId: '1234A'};
    const response = await request.post(URL, {data:newPayload});
    expect([400,422]).toContain(response.status());
})

test('Reject zero apogee', async ({ request }) => {
    const newPayload = { ...validPayload(), apogee: 0 };
    const response = await request.post(URL, { data: newPayload });
    expect([400, 422]).toContain(response.status());
  });

 
  test('Reject zero period', async ({ request }) => {
    const newPayload = { ...validPayload(), period: 0 };
    const response = await request.post(URL, { data: newPayload });
    expect([400, 422]).toContain(response.status());
  });

  test('Reject zero inclination', async ({ request }) => {
    const newPayload = { ...validPayload(), inclination: 0 };
    const response = await request.post(URL, { data: newPayload });
    expect([400, 422]).toContain(response.status());
  });

  test('Reject zero Perigree', async ({ request }) => {
    const newPayload = { ...validPayload(), perigree: 0 };
    const response = await request.post(URL, { data: newPayload });
    expect([400, 422]).toContain(response.status());
  });

  test('Reject zero Dry mass', async ({ request }) => {
    const newPayload = { ...validPayload(), dryMass: 0 };
    const response = await request.post(URL, { data: newPayload });
    expect([400, 422]).toContain(response.status());
  });

  test('Reject zero launchMass', async ({ request }) => {
    const newPayload = { ...validPayload(), launchMass: 0 };
    const response = await request.post(URL, { data: newPayload });
    expect([400, 422]).toContain(response.status());
  });

test('Reject empty payload', async ({ request }) => {
    const response = await request.post(URL, { data: {} });
    expect([400, 422]).toContain(response.status());
  });


