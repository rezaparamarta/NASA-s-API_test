const request = require('supertest');
const chai = require('chai');
const assert = chai.assert;
const baseUrl = require('../env'); // Import base URL
const config = require('../config'); // Import API key
// chai.use(require('chai-json-schema')); 
// const fs = require('fs');

describe('GET NASA NEO Data', () => {
    let response;

    before(async () => {
        response = await request(baseUrl())
            .get(`feed?start_date=2015-09-07&end_date=2015-09-14&api_key=${config.apiKey}`);
            // console.log('Response:', JSON.stringify(response.body, null, 2));
    });
    // Test Case 1
    it('should return status code 200', () => {
        assert.equal(response.statusCode, 200);
        console.log('Response Code:', response.statusCode);
    });

    // Test Case 2
    // Test Case: Ensure data exists and close approach dates are within the requested range
    it('should return data for the correct date range and validate close approach dates', () => {
        const startDate = '2015-09-07';
        const endDate = '2015-09-14';

        // Ambil semua tanggal dari response
        const availableDates = Object.keys(response.body.near_earth_objects).sort();

        // Pastikan tanggal dalam response sesuai dengan range yang diminta
        availableDates.forEach(date => {
            assert.isAtLeast(new Date(date).getTime(), new Date(startDate).getTime(), 
                `Data for ${date} is before ${startDate}`);
            assert.isAtMost(new Date(date).getTime(), new Date(endDate).getTime(), 
                `Data for ${date} is after ${endDate}`);
        });

        console.log('Available dates in response:', availableDates);

        // Validasi bahwa setiap asteroid memiliki close approach date dalam range yang benar
        availableDates.forEach(date => {
            response.body.near_earth_objects[date].forEach(asteroid => {
                asteroid.close_approach_data.forEach(approach => {
                    assert.isAtLeast(new Date(approach.close_approach_date).getTime(), new Date(startDate).getTime(), 
                        `Close approach date ${approach.close_approach_date} is before ${startDate}`);
                    assert.isAtMost(new Date(approach.close_approach_date).getTime(), new Date(endDate).getTime(), 
                        `Close approach date ${approach.close_approach_date} is after ${endDate}`);
                });
            });
        });

        console.log('All close approach dates are within the range:', startDate, 'to', endDate);
    });
    // 
    // it('should return data with correct date', () => {
    //     assert.property(response.body.near_earth_objects, '2015-09-07');
    //     console.log('Data exists for date 2015-09-07 untill 2015-09-14:', Object.keys(response.body.near_earth_objects));
    // });
    // // Test Case 3
    // it('should have close approach dates within the requested range', () => {
    //     const startDate = '2015-09-07';
    //     const endDate = '2015-09-14';
    
    //     Object.keys(response.body.near_earth_objects).forEach(date => {
    //         response.body.near_earth_objects[date].forEach(asteroid => {
    //             asteroid.close_approach_data.forEach(approach => {
    //                 assert.isAtLeast(new Date(approach.close_approach_date).getTime(), new Date(startDate).getTime(), 
    //                     `Close approach date ${approach.close_approach_date} is before ${startDate}`);
    //                 assert.isAtMost(new Date(approach.close_approach_date).getTime(), new Date(endDate).getTime(), 
    //                     `Close approach date ${approach.close_approach_date} is after ${endDate}`);
    //             });
    //         });
    //     });
    
    //     console.log('All close approach dates are within the range:', startDate, 'to', endDate);
    // });

    //Test Case 3
    it('should log asteroid data for each date in ascending order', () => {
        const sortedDates = Object.keys(response.body.near_earth_objects).sort(); // Urutkan tanggal dari terkecil ke terbesar
        
        sortedDates.forEach(date => {
            console.log(`\nAsteroids on ${date}:`);
            
            response.body.near_earth_objects[date].forEach((asteroid, index) => {
                console.log(`  ${index + 1}. ID: ${asteroid.id}, Name: ${asteroid.name}, 
         Close Approach Date: ${asteroid.close_approach_data[0]?.close_approach_date}, 
         Estimated Diameter (km): ${asteroid.estimated_diameter.kilometers.estimated_diameter_min} - ${asteroid.estimated_diameter.kilometers.estimated_diameter_max}, 
         Potentially Hazardous: ${asteroid.is_potentially_hazardous_asteroid}`);
            });
        });
    });

    // it('should match the JSON schema', () => {
    //     const schemaPath = './resources/jsonSchema/neo-schema.json';
    //     const jsonSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    //     assert.jsonSchema(response.body, jsonSchema);
    // });
});
