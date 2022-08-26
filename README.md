# WhatsTool Assignment

## MERN Stack Developer Assignment - WT

### Assignment Name: Product Order to Delivery with Tracking System.

[Link to Actual assignment](https://whatstool.notion.site/MERN-Stack-Developer-Assignment-WT-78eddce396ef4bfea78f7def5b632f91)

- Steps:
  1) Place Order \
	a. Place Order API and generate tracking id. \
	b. Fetch Order API with tracking id assigned.
  2) Product Delivery.\
	a. Maintain Product delivery status with its delivery details like (Place, time and remaining time)
	
```
//Product Delivery
"Apple Mac Book" : [
	{
		"status":"dispatched",
		"place":"Hazaribag, Jharkhand",
		"time":"21 Aug, 2022 12:00 AM"
		"toBeDeliveredTime":"within 6 days"
	},
	{
		"status":"on the way",
		"place":"ABC, Andhra Pradesh",
		"time":"22 Aug, 2022 12:00 AM"
		"toBeDeliveredTime":"within 4 days"
	},
	{
		"status":"on the way",
		"place":"ABC, XYZ",
		"time":"24 Aug, 2022 12:00 AM"
		"toBeDeliveredTime":"within 1 days"
	},
	{.....},
	{
		"status":"Delivered",
		"place":"ABC, XYZ",
		"time":"26 Aug, 2022 12:00 AM"
		"toBeDeliveredTime":"0 days"
	},
]
```
  - Create an API for updating the product delivery status by changing place with time \
	a. This should be in list form \
		i. 1st place and time with remaining timing,\
	       ii. 2nd place and time with remaining timing, \
	      iii. nth place and time with remaining timing, \
	b. Lasty update the status of product has been delivered.
