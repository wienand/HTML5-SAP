HTML5-SAP
=========

HTML5 AngularJS application to create goods receipt documents directly in SAP:

  * This application scans QR codes containing material numbers
  * It gets the list of materials from an SAP system
  * It can book good receipts docuements directly in SAP
  * It only needs a web server, nothing special to be installed on SAP side
  * Demonstrates how you can directly access and change SAP data from javascript applications
  * Works also on mobile devices (tested with an LG Android phone and Opera)

To use, follow these steps:

  1. Create a function module in the SAP system with the code from SAP\Z_FM_OWW_HTML_AT_SAP

  2. Activate the function module for web rfc in SMW0 (Internet Release Menu)

  3. Check the web rfc via http://<SAP-SYSTEM>:<SAP-PORT>/sap/bc/webrfc?_FUNCTION=Z_FM_OWW_HTML_AT_SAP&material=*

If you get back a list of materials the SAP is very likely to work ;)

  4. Change the URLs in the file app/scripts/controller/main.js to point either directly to the SAP system or to
     a reverse proxy (e.g. for SSL offloading)

  5. If you serve the html app from a different host as used for the access to the SAP system you have to take care of all CORS requirements
     or disable CORS in your browser.
     I recommend connecting to SAP via a reverse proxy which also serves the application.

  6. Browse to the application to scan and book QR codes to your SAP systems

For details regarding the SAP part I used the following blog post: http://scn.sap.com/community/netweaver-as/blog/2012/08/07/webrfc--simply-calling-an-rfc-from-javascript

Please note that this is just a proof of concept which does not consider security related issues.

Screenshots:
============

  1. Log in with SAP user:
     ![Image](images/login.png?raw=true)
  2. Loads list of materials from SAP system:
     ![Image](images/materials.png?raw=true)
  3. Scan a QR code containing a material number (e.g. from http://goqr.me/):
     ![Image](images/scan.png?raw=true)
  4. Create the good receipt documents in SAP:
     ![Image](images/transferred.png?raw=true)

What is where:
==============
  * QR code logic as an angular directive (based on https://github.com/LazarSoft/jsqrcode): app/controller/angular-qr-code.js
  * Javascript / angular code for interacting with SAP: app/scripts/main.js
