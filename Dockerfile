FROM oven/bun:1

RUN apt-get update && apt-get install -y \
    libfontconfig1 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "start"]