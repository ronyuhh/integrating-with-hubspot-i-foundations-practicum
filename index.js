require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.HUBSPOT_ACCESS_TOKEN;

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

// * Code for Route 1 goes here

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

// * Code for Route 2 goes here

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

// * Code for Route 3 goes here

/** 
* * This is sample code to give you a reference for how you should structure your calls. 

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try { 
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/


// * Localhost

app.get('/', async (req, res) => {
  const url = 'https://api.hubapi.com/crm/v3/objects/2-270412178';

  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.get(url, {
      headers,
      params: {
        properties: 'book_name,author,reading_status'
      }
    });

    const books = response.data.results;

    res.render('index', {
      title: 'My Books | HubSpot',
      books: books
    });
  } catch (error) {
    console.error(
      'HubSpot API error:',
      error.response?.data || error.message
    );

    res.status(500).send(
      'Could not load Books from HubSpot. Check the terminal for details.'
    );
  }
});

app.get('/form', (req, res) => {
  res.render('form', {
    title: 'Add or Update a Book | HubSpot'
  });
});


app.post('/save', async (req, res) => {
  const baseUrl =
    'https://api.hubapi.com/crm/v3/objects/2-270412178';

  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
  };

  const properties = {
    book_name: req.body.book_name.trim(),
    author: req.body.author.trim(),
    reading_status: req.body.reading_status
  };

  try {
    // Search for a book with the same name
    const searchResponse = await axios.post(
      `${baseUrl}/search`,
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'book_name',
                operator: 'EQ',
                value: properties.book_name
              }
            ]
          }
        ],
        properties: ['book_name', 'author', 'reading_status'],
        limit: 1
      },
      { headers }
    );

    const existingBooks = searchResponse.data.results;

    if (existingBooks.length > 0) {
      // Update the existing book
      const bookId = existingBooks[0].id;

      await axios.patch(
        `${baseUrl}/${bookId}`,
        { properties },
        { headers }
      );

      console.log('Book updated successfully.');
    } else {
      // Create a new book
      await axios.post(
        baseUrl,
        { properties },
        { headers }
      );

      console.log('Book created successfully.');
    }

    res.redirect('/');
  } catch (error) {
    console.error(
      'Could not save book:',
      error.response?.data || error.message
    );

    res.status(500).send(
      'Could not save the book. Check the VS Code terminal for details.'
    );
  }
});


app.listen(3000, () => console.log('Listening on http://localhost:3000'));