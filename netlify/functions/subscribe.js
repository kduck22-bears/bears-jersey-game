exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body);
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email required' }) };
  }

  const API_KEY = process.env.BEEHIIV_API_KEY;
  const PUB_ID = process.env.BEEHIIV_PUBLICATION_ID;

  try {
    const response = await fetch(`https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: 'jersey-game',
        utm_medium: 'game',
        utm_campaign: 'bears-jersey-challenge'
      })
    });

    const data = await response.json();

    // If already subscribed Beehiiv returns the existing subscription
    if (response.ok) {
      const status = data.data?.status;
      const alreadySubscribed = status === 'active' || status === 'validating';
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, alreadySubscribed })
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.message || 'Subscription failed' })
      };
    }
  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
