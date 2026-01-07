# HomeSweetHome Add-on

Add-on Home Assistant con ingress su porta 8092.

## Config
- slug: `homesweethome`
- ingress: `8092`
- image: `ghcr.io/llingua/homesweethome-{arch}`

## Build (locale)
```bash
docker build -t homesweethome-addon ./addon-homesweethome
```

## Note
Il Dockerfile clona il repo `HomeSweetHome` dal branch `main`.
Aggiorna l'URL se il repository cambia.

## Publish immagini multi-arch (GHCR)
```bash
docker login ghcr.io
docker buildx create --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/llingua/homesweethome-amd64:0.1.0 \
  -t ghcr.io/llingua/homesweethome-aarch64:0.1.0 \
  --push \
  ./addon-homesweethome
```
