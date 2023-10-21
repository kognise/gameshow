# Gameshow

At the [Outernet](https://outernet.hackclub.com/) hackathon, I and a couple friends — [Spencer](https://github.com/Scoder12), [Caleb](https://github.com/cjdenio), [Andrew](https://github.com/ajkachnic) and maybe some other people all did stuff — built this really cool array of giant red buttons powered by an old Arduino Mega 2560 I've had for years.

I had ordered the buttons off Aliexpress for very cheap with very expensive shipping and had done a bunch of soldering and wiring work leading up to the event. I swapped out the original lights with very bright LEDs I bought. I also made a bunch of these cool button enclosure thingies (thanks [Leo](https://github.com/leomcelroy) for the inspiration) that are gaff-taped cardboard but with PVC pipes at the bottom to make them slam resistant.

With a bunch of giant, brightly-lit, slam-resistant buttons, we had to do stuff! On the bus I wrote some Arduino firmware to drive the buttons. Then we made various games with this Node.js backend I made. Our main demos were a whack-a-mole game I wrote, and a rhythm game (basically an Osu!Mania clone) that used the buttons to trigger notes. Caleb built the game and I wrote a program to parse Osu! maps and convert them to his game.

I wish I had more photos but this was a very fun project and I am now officially tired of procrastinating putting the code on GitHub.

WHACK-A-MOLE:

https://github.com/kognise/gameshow/assets/42556441/3ad79760-291b-429c-97da-ead167e40451

Me doing terribly at the rhythm game:

![](https://doggo.ninja/6XiTg8.png)

More whack-a-mole:

![](https://doggo.ninja/exEfo0.png)

## Notes

Called gameshow because originally I wanted to make Jeopardy!

I wrote whack-a-mole without testing it during lunch, and it worked first try.

Please excuse the repository structure (or lack thereof).
