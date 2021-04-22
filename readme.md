# NapicuWebGame - Pong

## Upozornění
* Hra není optimalozováná pro výkon!
* Nedoporučuje se hostovat hru na slabém hostingu!
* Doporučujeme hostovat pouze na localhostu!

***
## Hra pro více hráčů
* Hráč 1 pošle kód  Hráči 2, který ho následně zadá do kolonky Připojit se
* Jestli kód opsal správně půjde odestal pozvánka

* `Informace` 
    * Pozvánka můžete poslat pouze hráči, který ještě žádnou pozvánku nedostal
    * Nelze pozvat hráče, který již hraje
    * Hra se automaticky ukončí, když 1 z hráčů odpojí hru. Druhému hráči se automaticky vygeneruje nový kód 
***
## Instalace
* instalace balíčku 
```
npm i
```
* .env - port na kterém aplikace poběží
```
PORT=8080
```
***
## Celé fungování hry
* Při připojení do hry se automaticky vygeneruje základní informace o hráči ve funkci GetNewRoom()
    * ActivityRoom = RoomId ve které se uživatel nachází
    * Player = Ve hře - Rozlišení zda je hráč "Hrac1" nebo "Hrac1" 
* Při requestu
    * Kontroluje se zda zadané room id není room id zadavatele 
    * Kontroluje se zda v roomce není 2 a více hráčů 
    * Uloží se PlayersRequest Map() id hráče který chce být pozván a id hráče, který vytvořil pozvánku 
    * Kontroluje se hráč v roomce nemá již ( z PlayersRequest ) poslaný request od jiného hráče
    * Zda je vše v pořádku pošle se invite hráči v roomce
    * Také se pošle zadavateli potvrzení o poslání requestu hráči
* Při acceptu
    * Kontroluje se zda Hráč který poslal pozvánku se neodpojil
    * Odstraní se id z PlayersRequest 
    * Hráč který vytvořil pozvánku se připojí k hráči ( "Majitele roomky" )
    * Nastaví se socket.Player - Hrac1 - Majitel roomky 
    * Dále se nastaví Hráči2 ActivityRoom (id roomky)
    * Připojí se k Hraci1
    * Do roomky se pošle emit Ready
    * Zda je vše v pořádku pošle se emit PingStart 
* Při PingStart
    * Kontroluje se zda hráči i nejsou v Players (Map())
    * Také se kontroluje zda Koule s id roomky není v Balls (Map())
    * Zda je hráč Hrac1 dostane souřadnice x: 100
    * Zda je hráč Hrac2 dostane souřadnice x: 1700
    * Dále se vytvoří Player (class)
    * Dále se vytvoří Ball (class)
    * Poté se uloží do Players (Map()) id hráče a všechny údaje o hráči
    * Do Balls se uloží id roomky a všechny další údale o ball
    * Následuje setInterval funkce která opakuje Render
* Render function
    * Spouští se funkce Koule.Render(), která hýbe koulí 
    * Dále se odesílá do roomky údaje o kouli
    * Poté se spouští funkce PlayerPush, která odesílá do roomky údaje o hráčích, kteří jsou v dané roomce
    * Funkce Render se opakuje každých 33ms (Z tohoto důvodu není doporučené hostovat tuto appku) 
* Při START
    * Odešle se do roomky emit o STARTU hry
    * U klienta se spustí funkce StartRender(), které spustí funkci requestAnimationFrame() která se opakuje podle frekvence monitoru a podle toho zda je Game.Player = true. Jestli je Game.Player = false, canvas se nebude renderovat
    * Také se spustí funkce Start(), která upraví prostředí pro hraní
* Game.Render() function
    * Začne renderovat Background, ,Player Ball, 
    * Kontroluje zda MoveKey.Up nebo MoveKey.Down je true
    * Zda je MoveKey.Up nebo MoveKey.Down true pošle se emit serveru PlayerMoveUp nebo PlayerMoveDown
* Při PlayerMoveUp
    * Hráč se posune nahoru 
* Při PlayerMoveDown
    * Hrac se posune dolů
* Player.Render() function 
    * Spustí se funkce Player.Get(), která pošle emit PlayerUpdate který na serveru hýbe hráčem
    * Zda dostane PlayerMove uloží se u klienta údaje o hráčovi
    * Poté se už renderuje podle údajů u klienta
* Ball.Render() function
    * Spustí se funkce Ball.get(), která získá údaje o kouli a uloží se u klienta
    * Poté se spustí funkce Ball.MainRender(), která renderuje podle údajů u klienta
* Při disconnect
    * Stopne se intervatFun ( setInterval() )
    * Vymaže se Balls s id socketu ze kterého se uživatel odpojil
    * Vymažou se údaje o hráčovi z Players
    * Spustí se funkce PlayerLeftGame()
***
## Další funkce
* PlayerPush() posílá do roomky údaje o hráčích které jsou v dané roomce
* randomString() vygeneruje se hex string o délce 5
* GETPlayersDataSocketRoom() vrátí údaje hráčů v roomce
* GetRoomPlayers() vrátí socket id hráčů v roomce
* GetPlayerByRoom() vrátí socket id prvního hráče v roomce
* PlayerLeftGame() Pošle do roomky emit PlayerLeft a spustí funkci GetNewRoom()
* GetNewRoom() vygeneruje základní údaje (roomName, Player)
***





## Použité balíčky
* crypto@1.0.1
* dotenv@8.2.0
* ejs@3.1.6
* express@4.17.1
* nodemon@2.0.7
* socket.io@4.0.1
