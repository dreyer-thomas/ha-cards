# ha-cards – Dashboard-Karten für Home Assistant

Zwei Karten im Stil der Growatt-SPH-Karte aus
[growatt-modbus-ha](https://github.com/dreyer-thomas/growatt-modbus-ha). Beide finden ihre
Entitäten selbst – die minimale Konfiguration ist nur der Kartentyp.

| Wetterstation | Regen & Wind | Nacht | DiskStation | Warnung |
|---|---|---|---|---|
| ![](screenshots/wetterstation.png) | ![](screenshots/wetterstation-regen.png) | ![](screenshots/wetterstation-nacht.png) | ![](screenshots/diskstation.png) | ![](screenshots/diskstation-warnung.png) |

## Installation

Marketplace (HACS): **Einstellungen → Marketplace → Aus Link hinzufügen** →
`https://github.com/dreyer-thomas/ha-cards`, Kategorie **Dashboard**, herunterladen, Seite neu laden.

Manuell: `dist/ha-cards.js` nach `/config/www/` kopieren und unter
Einstellungen → Dashboards → ⋮ → Ressourcen als JavaScript-Modul `/local/ha-cards.js` eintragen.

## Wetterstation

```yaml
type: custom:hc-weather-station-card
title: Wetterstation   # optional
```

- Himmel nach Messwerten: Sonne (Sonnenscheindauer zählt gerade hoch), bewölkt, Regen
  (Regensensor), Nacht (`sun.sun`), Wind ab 20 km/h mit Böen-Animation
- Temperatur mit Tageshoch und -tief, Windrose mit Richtung und Schwankungsbereich
- Kacheln: Luftfeuchte, Wind, Regen heute, Sonne heute – ein Klick öffnet den Verlauf
- Warnung bei schwacher Batterie

Gefunden wird automatisch eine Homematic-Station (HM-WDS100 u. ä., Integration
„Homematic(IP) Local“). Andere Stationen per Zuordnung:

```yaml
type: custom:hc-weather-station-card
entities:
  temperature: sensor.aussen_temperatur
  humidity: sensor.aussen_feuchte
  wind_speed: sensor.wind
  wind_direction: sensor.windrichtung      # Grad, 0 = Nord
  rain_total: sensor.regenzaehler          # fortlaufender Zähler in mm
  raining: binary_sensor.regen
  sunshine: sensor.sonnenscheindauer       # fortlaufender Zähler in min
```

„Regen heute“, „Sonne heute“ und Hoch/Tief kommen aus der Langzeitstatistik von Home Assistant.

## DiskStation

```yaml
type: custom:hc-diskstation-card
title: DiskStation   # optional, sonst Gerätename
```

- NAS-Grafik mit einer Status-LED pro Laufwerksschacht, Netzwerkverkehr als Fluss
- Statuszeile nach Wichtigkeit: defekte Platte → Volume-Problem → DSM-Update → Sicherheitsberater
- Belegung des Volumes mit freiem Platz, CPU, Arbeitsspeicher, Upload, Download
- Liste der Platten mit Status und Temperatur (Klick öffnet den Temperaturverlauf)

Benötigt die Integration **Synology DSM**. Bei mehreren DiskStations `device_id:` angeben.

## Entwicklung

`tools/preview.html` zeigt beide Karten mit Beispieldaten im Browser
(`?card=weather` bzw. `?card=nas`).

Gestaltung angelehnt an die Karten von [BavarianData](https://github.com/JustChr/BavarianData) (MIT).

## Haftung

MIT-Lizenz, Nutzung auf eigene Verantwortung.
