# Hyperdrive Portal

Making use of the [Dat SDK](https://github.com/datproject/sdk) to view and seed Hyperdrives in the context of a non-Beaker web browser. This was written for the [Hackers & Designers 2020 Summer Academy](https://hackersanddesigners.nl/s/Summer_Academy_2020) as means of documenting and publishing our files during the course of the week.

**→ → → { [hyperdrives.hackersanddesigners.nl](https://hyperdrives.hackersanddesigners.nl) } ← ← ←**

<img align="center" src="./loading-scatter.gif" />
<!--<center>![](loading-scatter.gif)</center>-->

## How it works

1. Multiple people create and serve Hyperdrives from their personal computers. 
2. Each of their respective keys is manually placed in the [`index.js`](./index.js) script, which in turn, is served _statically_ from [hyperdrives.hackersanddesigners.nl](https://hyperdrives.hackersanddesigners.nl).
3. The "client" parses the keys in their browser and views the contents using the [bundled dat-sdk](./dat-sdk-bundle.js).
4. The "client" is also a peer, using the SDK to seed the files to the network.

## Development

To run a Hyperdrive portal for you and your friends, first clone the repository:
```bash
git clone git@github.com:karlmoubarak/hyperdrive-portal.git
cd hyperdrive-portal
```
Then, open [`index.js`](./index.js) in your favorite text editor and replace these hyper keys with your friends keys:
```js
keys = [ 
    'hyper://af71efec1e978a6d665700f1e083f603790cae1cab28dc2df634502a7016688e/', // jeroen
    'hyper://436fc91f71cceb2ae85d39ef5b40eb3e5dcba6a802a5960c341845f32a6527aa/', // karl
    'hyper://eed171b9da743ccbf6452722f72a1b14a5b25115594f56c34cc0a848828fe896/', // angeliki
    'hyper://1f2f00ec6ffcc2e7db9d4586b5b80eac73201a6e2c0add4430c4ed13b7ee76c0/', // dianaband
    'hyper://42445f16ce32b9bfd8dc6bddfd9efe7a18875709acc3bb3ad7301fa1f0a23eb3/', // anja
    'hyper://fb30c8a724fb93e9e3f0209055453f8a672ff01720a33f8111d76382dbfda28a/', // cristina
    'hyper://5f2e47e66aad6de752f7510413d5861392282d5b3a40073c0f2e5dcc5553ce5d/', // lark
    'hyper://711d0b2c6eb9c180a44b0655a7cec8f0d4bac1a4bdc78bf270d28ae6f09d61a6/', // Ephemereality Capture
    'hyper://1b518bc8595f898b4072973c8f2a74ce49f4f7497498377ebb1166032108fe8b/', // Selby
    'hyper://4da9e7e45960ea06c311e1e502fc81c46fd310dbd0098f1c7c64d196625cde5b/', // fame
    'hyper://dfe88b3c04d22b2a29012abb522f70437bb70a3d14075e19a242894a5ba3bba2/', // anniek
    'hyper://0ad7cfefbc077cafcec21ffeedbbab4efb3190f6a507e2353ca3cf5c9024a942/', // juju
    'hyper://e70fcd16b6ec6e521857fdab6e26ff158864596e957362f1f5121d2113e0956c/', // danny
    'hyper://4aca999260500a596997031be92fdc89ab813b354a1274edf9f76f1ebf70e272/', // Chinouk
    'hyper://81a02db9baf116674bb2075fd24b9f68e451a59b600f2df99a1689eb649ebd4b/', // Eric
    'hyper://c9201e7f4fe5f1f2e6fa214d817b5566e25f2c874c6e505653ed44e810d0bf8a/', // Stan
    'hyper://7dc0317665c2057993b1f5cf02d218564120468a9a8b9f1db4a61366ac9171a8/', // Heerko
    'hyper://86b61fe7d2dc432ba0c0b6a651521135304b0cb68c042a192a10be85519376b4/', // kwan
    'hyper://e09eb41993d0f2af0410ea51623ab60a3b809c7823929e9824ad5e0c0d8be05e/', // wendy
    'hyper://053c09d3b4abf9532e50a0fe6d8a59aa650ca00d50a1183abdae3f5e96809513/' // Ben
    ],
```
Then, change the title, texts, and interface from the [`index.html`](./index.html) to fit your needs. With all of this done, you can go ahead and deploy the files to your own server. It will only contain the necessary client-side scripts to view the files. The contents of the hyperdirves are never pulled into the server.

**!!! MORE DETAILED INSTRUCTIONS COMING SOON !!!**

## Team

Karl Moubarak and the participants of HDSA2020.<br>
Built with the generous support of [Mauve](https://ranger.mauve.moe/) and the Dat Community.

## License

[Creative Commons Attribution Share Alike 4.0 International](./LICENSE) <br>
In short → you can copy, change, and even use this code for profit, but you have to republish it under the same license (it stays in the public domain).