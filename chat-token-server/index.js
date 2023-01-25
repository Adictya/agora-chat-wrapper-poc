// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true });
const nanoid = import('nanoid').then(res => res.nanoid);
const ChatTokenBuilder =
  require('./AgoraToken/ChatTokenBuilder').ChatTokenBuilder;

const agora = {
  appId: 'ae960e22ace240058e0333141cd6e739',
  cert: 'aec28dedebf84eb397cbd337c7050d44',
  expiry: 600,
};

const ac = {
  AppKey: '61807588#1063958',
  OrgName: '61807588',
  AppName: '1063958',
  HostName: 'https://a61.chat.agora.io',
  AppToken: ChatTokenBuilder.buildAppToken(
    agora.appId,
    agora.cert,
    agora.expiry,
  ),
};

const url = `${ac.HostName}/${ac.OrgName}/${ac.AppName}`;

const refreshAppToken = () => {
  ac.AppToken = ChatTokenBuilder.buildAppToken(
    agora.appId,
    agora.cert,
    agora.expiry,
  );
  console.log('apptoken refreshed', ac.AppToken);
};

fastify.get('/refreshAppToken', async (request, reply) => {
  refreshAppToken();
  return 200;
});

fastify.get('/register', async (request, reply) => {
  const nickname = request.query.uid;
  const password = request.query.pwd;
  const username = (await nanoid)();
  const uuid = await fetch(url + '/users', {
    method: 'POST',
    headers: new Headers({
      Authorization: `Bearer ${ac.AppToken}`,
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      username,
      password,
      nickname,
    }),
  })
    .then(res => res.json())
    .then(res => res.entities[0].uuid);
  const token = ChatTokenBuilder.buildUserToken(
    agora.appId,
    agora.cert,
    uuid,
    agora.expiry,
  );
  console.table({
    nickname,
    password,
    username,
    uuid,
    token: token.slice(0, 10),
  });
  return { token: token, uuid, username, nickname };
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
