# ha-cards – Dashboard-Karten für Home Assistant

Karten im Stil der Growatt-SPH-Karte aus
[growatt-modbus-ha](https://github.com/dreyer-thomas/growatt-modbus-ha). Alle finden ihre
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

## Geschirrspüler

```yaml
type: custom:hc-dishwasher-card
```

| Läuft | Bereit |
|---|---|
| ![](screenshots/geschirrspueler.png) | ![](screenshots/geschirrspueler-bereit.png) |

- Küchenzeile mit Gerät: Restzeit im Display, Fortschrittsleiste, „infoLight“ auf dem Boden während des Programms,
  offene Tür mit Korb, Funkeln wenn fertig
- Statuszeile: „Läuft · fertig um 12:25“, „Startvorwahl“, „Fertig – bitte ausräumen“, Störung
- Fortschritt und Restzeit, Kacheln für Programm, Tür, Salz und Klarspüler, Hinweise bei Nachfüllbedarf
- **Programm starten** (gewähltes Programm, nur wenn Fernstart aktiv ist) und **Programm stoppen** – jeweils mit Rückfrage

Benötigt die Integration **Home Connect**.

## Ladestation

```yaml
type: custom:hc-wallbox-card
```

| Lädt | Frei |
|---|---|
| ![](screenshots/ladestation.png) | ![](screenshots/ladestation-frei.png) |

- Wallbox mit Statusring, Ladekabel und Auto, Energiefluss beim Laden
- Zeigt das Foto des eigenen Autos, wenn die Integration **BavarianData** ein Fahrzeugbild liefert (wird automatisch erkannt). Sonst eine Zeichnung.

```yaml
type: custom:hc-wallbox-card
car_image: image.mein_auto   # eigenes Bild: image-Entität, Entität mit Bild oder URL; "none" = Zeichnung
```
- Leistung, Energie des Ladevorgangs, Ströme je Phase (L1–L3)
- kWh heute, im laufenden Monat (aus der Langzeitstatistik) und gesamt, Griff-Temperatur

Benötigt die Integration **Tesla Wall Connector**.

## Drucker

```yaml
type: custom:hc-printer-card
```

![](screenshots/drucker.png)

- Drucker mit Tintentanks im Bild, Papier läuft beim Drucken heraus
- Füllstand je Farbe mit Warnschwelle des Druckers, Warnung „… bald nachfüllen“

Benötigt die Integration **Internet Printing Protocol (IPP)**.

## Lüftung

```yaml
type: custom:hc-ventilation-card
```

| Nach Plan | Party (manuell) |
|---|---|
| ![](screenshots/lueftung.png) | ![](screenshots/lueftung-party.png) |

- Haus mit Lüftungsgerät: Lüfterrad und Luftströme (Frischluft/Fortluft) laufen je nach Stufe schneller
- Moduswahl per Tipp (Optionen des `input_select`), Anzeige „nach Plan“ oder „manuell“
- Tagesverlauf heute und morgen aus den Zeitplänen, nächster Wechsel
- Warnt, wenn die Relais der Stufen (z. B. Homematic HM-LC-Sw4-WM) nicht zum Modus passen, und bei schwacher Batterie

Gedacht für Anlagen, deren Stufe über einen `input_select` und Automationen geschaltet wird.
Gefunden wird alles mit „Lüftung“ im Namen; sonst angeben:

```yaml
type: custom:hc-ventilation-card
entity: input_select.lufter_haus
schedules:            # Zeitplan je Modus (schedule-Helfer)
  Normal: schedule.luftungsplan_normal
  Niedrig: schedule.luftungsplan_niedrig
stages: [switch.stufe_1, switch.stufe_2, switch.stufe_3, switch.stufe_4]   # optional, in Reihenfolge der Modi
```

Die Zeiten der Pläne kann nur ein Administrator-Konto lesen; sonst zeigt die Karte nur den nächsten Wechsel.

## Müllabfuhr

```yaml
type: custom:hc-waste-card
```

![](screenshots/muell.png)

- Tonnen vor dem Zaun; was heute oder morgen abgeholt wird, steht an der Straße
- „Morgen: Biomüll – heute Abend rausstellen“, je Tonne der nächste Termin
- Kalender der laufenden und nächsten Woche mit farbigen Punkten

Benötigt die Integration **Waste Collection Schedule** (Sensoren mit der Darstellung „upcoming“ liefern alle Termine).
Andere Sensoren: `entities: [sensor.…]`.

## FRITZ!Box

```yaml
type: custom:hc-fritzbox-card
```

| Online | Offline |
|---|---|
| ![](screenshots/fritzbox.png) | ![](screenshots/fritzbox-offline.png) |

- Router mit Status-LEDs, WLAN-Wellen und Datenfluss zum Internet; Unterbrechung rot markiert
- Download/Upload in Mbit/s, Auslastung des Anschlusses, Leitungswerte (DSL)
- Datenmenge heute (empfangen/gesendet), Geräte im Netz (WLAN/LAN), CPU-Temperatur
- WLAN und Gäste-WLAN schalten; QR-Code des Gäste-WLANs per Tipp. Abschalten des Haupt-WLANs wird vorher bestätigt
- Hinweis bei verfügbarem FRITZ!OS-Update

Benötigt die Integration **AVM FRITZ!Box Tools**. Repeater werden übergangen; bei mehreren Routern `device_id` angeben.

## Entwicklung

`tools/preview.html` zeigt die Karten mit Beispieldaten im Browser
(`?card=weather`, `nas`, `dw`, `wb`, `pr`, `fb`, `vent` oder `waste`).

Gestaltung angelehnt an die Karten von [BavarianData](https://github.com/JustChr/BavarianData) (MIT).

## Haftung

MIT-Lizenz, Nutzung auf eigene Verantwortung.
