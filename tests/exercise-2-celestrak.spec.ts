import {test, expect} from '@playwright/test';

const URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=last-30-days&FORMAT=json'; 

test.describe('Exercise 2 - Celestrack', () => {
    test('Check response', async ({request}) => {
        const response = await request.get(URL);
    
    //Check if the response is returned with data (200) or with no data (204)
    expect([200,204]).toContain(response.status());

    // In case of the response to be returned with no that 
    // this test verify that the response is empty
    if (response.status() === 204){
        const responseText = await response.text();
        expect(responseText).toBe('');
        return
    }

    // In case of the response is returned with data, this test
    // checks if the response has at least one object
    const objects = await response.json();
    expect(Array.isArray(objects)).toBe(true);
    expect(objects.length).toBeGreaterThan(0);

    // 30 days ago in miliseconds
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    for (const obj of objects) {
      // 1. EPOCH should be a valid date within the last 30 days 
      const epochDayConverted = Date.parse(obj.EPOCH); 
      expect(Number.isNaN(epochDayConverted)).toBe(false);
      expect(epochDayConverted).toBeGreaterThanOrEqual(thirtyDaysAgo);

      // 2. OBJECT_ID should have COSPAR format (ex.: 2022-176A ou 2022176ABC)
      expect(String(obj.OBJECT_ID)).toMatch(/^\d{4}-?\d{3}[A-Za-z]{1,3}$/);

      // 3. NORAD_CAT_ID must have five digits
      expect(String(obj['NORAD_CAT_ID'])).toMatch(/^\d{5}$/);
    }
});
});