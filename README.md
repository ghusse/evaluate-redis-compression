# evaluate-redis-compression

## Installation

```bash
git clone https://github.com/ghusse/evaluate-redis-compression.git
cd evaluate-redis-compression
npm install
npm link
```

## Usage

```bash
evaluate-redis-compression \
  --redisUrl="redis://u:p@server:123/db"
  --redisKeyPattern="/key-prefix/*"
```
