### Key:
|   Level    |                                                                           Meaning                                                                            |
| :--------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------: |
|    Full    |                                                       Full support, this feature will work completely                                                        |
|  Partial   |                                              This feature will work only partially, but it won't break anything                                              |
| Unintended | This feature hasn't been intentionally implemented, but it might work a little bit due to support for other features. Using it will probably break something |
|  Ignored   |             This feature won't work at all, but code has been made to intentionally ignore all references to it so that it won't break anything              |
|    None    |                                                                      No support at all                                                                       |
## Supported file formats:
### .chart
|      Feature      | Reader support | Game Support |
| :---------------: | :------------: | :----------: |
|    Instruments    |                |              |
|   5-fret guitar   |    Partial     |     None     |
|   6-fret guitar   |    Partial     |     None     |
|       Drums       |   Unintended   |     None     |
|      Lyrics       |      None      |              |
|                   |                |              |
|       Notes       |                |              |
|   Normal notes    |      Full      |     None     |
|    HOPO notes     |      Full      |     None     |
|     Tap notes     |      Full      |     None     |
|    Open notes     |      Full      |     None     |
|     Sustains      |      Full      |     None     |
| Extended Sustains |      Full      |     None     |
| Disjointed Chords |      Full      |     None     |
|                   |                |              |
|      Phrases      |                |              |
|   Star Phrases    |      Full      |     None     |
| GH P1/P2 phrases  |    Ignored     |     None     |
|       Solos       |    Ignored     |     None     |

Tracks with instruments that have Unintended or None levels of support can still be used, those instruments will just be unselectable.
  
## Unsupported file formats:
* .mid (Use [this program](https://github.com/raphaelgoulart/mid2chart) to convert .mid files to .chart files)
* .sng 
