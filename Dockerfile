FROM oven/bun:1

RUN apt-get update && apt-get install -y \
    build-essential \
    libfontconfig1 \
    ca-certificates \
    fontconfig \
    && echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections \
    && apt-get install -y --no-install-recommends \
    sed \
    && (sed -i 's/Components: main/Components: main contrib/g' /etc/apt/sources.list.d/debian.sources || sed -i 's/main$/main contrib/g' /etc/apt/sources.list) \
    && apt-get update \
    && apt-get install -y ttf-mscorefonts-installer \
    && fc-cache -f -v \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN mkdir -p /usr/share/fonts/local && \
    if [ -d "files/fonts" ]; then cp -r files/fonts/* /usr/share/fonts/local/; fi && \
    fc-cache -fv

CMD ["bun", "run", "start"]