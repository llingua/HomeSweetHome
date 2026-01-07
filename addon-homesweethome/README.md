# HomeSweetHome Add-on

Add-on Home Assistant con ingress su porta 8092.

## Config
- slug: `homesweethome`
- ingress: `8092`
- image: `homesweethome-{arch}`

## Build (locale)
```bash
docker build -t homesweethome-addon ./addon-homesweethome
```

## Note
Il Dockerfile clona il repo `HomeSweetHome` dal branch `main`.
Aggiorna l'URL se il repository cambia.
