# Hyperdrive Portal

Making use of the [Dat SDK](https://github.com/datproject/sdk) to view and seed Hyperdrives in the context of a non-Beaker web browser. This was written for the [Hackers & Designers 2020 Summer Academy](https://hackersanddesigners.nl/s/Summer_Academy_2020) as means of documenting and publishing our files during the course of the week.

<center><span>→ → → { https://hyperdrives.hackersanddesigners.nl } ← ← ← </span></center>

## How it works

1. Multiple people create and serve Hyperdrives from their personal computers. 
2. Each of their respective keys is manually placed in the [`index.js`](./index.js) script, which in turn, is served _statically_ from [hyperdrives.hackersanddesigners.nl](https://hyperdrives.hackersanddesigners.nl).
3. The "client" parses the keys in their browser and views the contents using the [bundled dat-sdk](./dat-sdk-bundle.js).
4. The "client" is also a peer, using the SDK to seed the files to the network.

## Development

