// webApp/src/components/shared/EmojiPicker.jsx
import React, { useState, useRef, useEffect } from 'react';

const EMOJI_DATA = {
  'Smilies': {
    icons: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','☹️','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
    emojis: {
      'Grinning Face':'😀','Grinning Face with Big Eyes':'😃','Beaming Face with Smiling Eyes':'😄','Grinning Squinting Face':'😁','Grinning Face with Sweat':'😆','Grinning Face with Smiling Eyes':'😅','Rolling on the Floor Laughing':'🤣','Crying Laughing':'😂','Slightly Smiling Face':'🙂','Upside Down Face':'🙃','Winking Face':'😉','Smiling Face with Smiling Eyes':'😊','Smiling Face with Halo':'😇','Smiling Face with Hearts':'🥰','Smiling Face with Heart Eyes':'😍','Star Struck':'🤩','Kissing Face with Heart Eyes':'😘','Kissing Face':'😗','Smiling Face':'☺️','Kissing Face with Closed Eyes':'😚','Kissing Face with Smiling Eyes':'😙','Face with Tears of Joy':'🥲','Yum':'😋','Face with Tongue':'😛','Winking Face with Tongue':'😜','Zany Face':'🤪','Squinting Face with Tongue':'😝','Money Mouth Face':'🤑','Hugging Face':'🤗','Face with Hand Over Mouth':'🤭','Shushing Face':'🤫','Thinking Face':'🤔','Saluting Face':'🫡','Zipper Mouth Face':'🤐','Hushed Face':'😐','Expressionless Face':'😑','Face without Mouth':'😶','Smirking Face':'😏','Unamused Face':'😒','Rolling Eyes':'🙄','Grimacing Face':'😬','Lying Face':'🤥','Relieved Face':'😌','Pensive Face':'😔','Sleepy Face':'😪','Drooling Face':'🤤','Sleeping Face':'😴','Mask':'😷','Face with Thermometer':'🤒','Face with Head Bandage':'🤕','Nauseated Face':'🤢','Face Vomiting':'🤮','Hot Face':'🥵','Cold Face':'🥶','Face with Cold Sweat':'🥴','Dizzy Face':'😵','Exploding Head':'🤯','Partying Face':'🥳','Disguised Face':'🥸','Smiling Face with Sunglasses':'😎','Nerd Face':'🤓','Face with Monocle':'🧐'
    }
  },
  'Gestures': {
    icons: ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','🫦'],
    emojis: {
      'Waving Hand':'👋','Back of Hand':'🤚','Hand with Fingers Splayed':'🖐️','Raised Hand':'✋','Vulcan Salute Hand':'🖐','Rightwards Hand':'🫱','Leftwards Hand':'🫲','Palm Down Hand':'🫳','Palm Up Hand':'🫴','OK Hand':'👌','Pinched Fingers':'🤌','Pinching Hand':'🤏','Victory Hand':'✌️','Crossed Fingers':'🤞','Hand with Index Finger and Thumb Crossed':'🫰','Love You Gesture':'🤟','Sign of the Horns':'🤘','Call Me Hand':'🤙','Backhand Index Pointing Left':'👈','Backhand Index Pointing Right':'👉','Backhand Index Pointing Up':'👆','Middle Finger':'🖕','Backhand Index Pointing Down':'👇','Index Pointing Up':'☝️','Index Finger Pointing at Viewer':'🫵','Thumbs Up':'👍','Thumbs Down':'👎','Raised Fist':'✊','Oncoming Fist':'👊','Left Facing Fist':'🤛','Right Facing Fist':'🤜','Clapping Hands':'👏','Raising Hands':'🙌','Heart Hands':'🫶','Open Hands':'👐','Palms Touching':'🤲','Handshake':'🤝','Folded Hands':'🙏','Writing Hand':'✍️','Nail Polish':'💅','Selfie':'🤳','Flexed Biceps':'💪','Mechanical Arm':'🦾','Mechanical Leg':'🦿','Leg':'🦵','Foot':'🦶','Ear':'👂','Ear with Hearing Aid':'🦻','Nose':'👃','Brain':'🧠','Anatomical Heart':'🫀','Lungs':'🫁','Tooth':'🦷','Bone':'🦴','Eyes':'👀','Eye':'👁️','Tongue':'👅','Mouth':'👄','Biting Lip':'🫦'
    }
  },
  'People': {
    icons: ['👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🧏','🙇','🤦','🤷','👮','🕵️','💂','🥷','👷','🤴','👸','👳','👲','🧕','🤵','👰','🤰','🫃','🫄','🤱','👼','🎅','🤶','🦸','🦹','🧙','🧚','🧛','🧜','🧝','🧞','🧟','🧌','💆','💇','🚶','🧍','🧎','🏃','💃','🕺','👯','🧖','🧗','🤸','⛹️','🏋️','🚴','🚵','🤼','🤽','🤾','🤺','⛷️','🏂','🏄','🏊','🤹'],
    emojis: {
      'Baby':'👶','Child':'🧒','Boy':'👦','Girl':'👧','Person':'🧑','Person Blond Hair':'👱','Man':'👨','Man Bearded':'🧔','Woman':'👩','Older Person':'🧓','Old Man':'👴','Old Woman':'👵','Person Frowning':'🙍','Person Pouting':'🙎','Person Gesturing No':'🙅','Person Gesturing OK':'🙆','Person Tipping Hand':'💁','Person Raising Hand':'🙋','Deaf Person':'🧏','Person Bowing':'🙇','Person Facepalming':'🤦','Person Shrugging':'🤷','Police Officer':'👮','Detective':'🕵️','Guard':'💂','Ninja':'🥷','Construction Worker':'👷','Prince':'🤴','Princess':'👸','Person Wearing Turban':'👳','Person with Skullcap':'👲','Woman with Headscarf':'🧕','Man in Tuxedo':'🤵','Bride with Veil':'👰','Pregnant Woman':'🤰','Pregnant Man':'🫃','Pregnant Person':'🫄','Breast Feeding':'🤱','Santa Claus':'🎅','Mrs Claus':'🤶','Superhero':'🦸','Supervillain':'🦹','Mage':'🧙','Fairy':'🧚','Vampire':'🧛','Merperson':'🧜','Elf':'🧝','Genie':'🧞','Zombie':'🧟','Gargoyle':'🧌','Face Massage':'💆','Haircut':'💇','Walking':'🚶','Person Standing':'🧍','Person Kneeling':'🧎','Person Running':'🏃','Woman Dancing':'💃','Man Dancing':'🕺','People with Bunny Ears':'👯','Person in Steamy Room':'🧖','Person Climbing':'🧗'
    }
  },
  'Nature': {
    icons: ['🐵','🐒','🦍','🦧','🐶','🐕','🦮','🐕‍🦺','🐩','🐺','🦊','🦝','🐱','🐈','🐈‍⬛','🦁','🐯','🐅','🐆','🐴','🐎','🦄','🦓','🦌','🦬','🐮','🐂','🐃','🐄','🐷','🐖','🐗','🐽','🐏','🐑','🐐','🐪','🐫','🦙','🦒','🐘','🦣','🦏','🦛','🐭','🐁','🐀','🐹','🐰','🐇','🐿️','🦫','🦔','🦇','🐻','🐻‍❄️','🐨','🐼','🦥','🦦','🦨','🦘','🦡','🐾','🦃','🐔','🐓','🐣','🐤','🐥','🐦','🐧','🕊️','🦅','🦆','🦢','🦉','🦤','🪶','🦩','🦚','🦜','🐸','🐊','🐢','🦎','🐍','🐲','🐉','🦕','🦖','🐳','🐋','🐬','🦭','🐟','🐠','🐡','🦈','🐙','🪼','🪸','🐚','🐌','🦋','🐛','🐜','🐝','🪲','🐞','🦗','🕷️','🕸️','🦂','🦟','🦠','💐','🌸','💮','🏵️','🌹','🥀','🌺','🌻','🌼','🌷','🌱','🪴','🌲','🌳','🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🍄','🪨','🌍','🌎','🌏','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌚','🌛','🌜','☀️','🌝','🌞','⭐','🌟','💫','🌠','🌌','☁️','⛅','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌪️','🌫️','🌊','💧','💦','☔','☂️','⚡','🌈','☂️'],
    emojis: {
      'Monkey Face':'🐵','Monkey':'🐒','Gorilla':'🦍','Orangutan':'🦧','Dog Face':'🐶','Dog':'🐕','Guide Dog':'🦮','Service Dog':'🐕‍🦺','Poodle':'🐩','Wolf':'🐺','Fox':'🦊','Raccoon':'🦝','Cat Face':'🐱','Cat':'🐈','Black Cat':'🐈‍⬛','Lion':'🦁','Tiger Face':'🐯','Tiger':'🐅','Leopard':'🐆','Horse Face':'🐴','Horse':'🐎','Unicorn':'🦄','Zebra':'🦓','Deer':'🦌','Bison':'🦬','Cow Face':'🐮','Ox':'🐂','Water Buffalo':'🐃','Cow':'🐄','Pig Face':'🐷','Pig':'🐖','Boar':'🐗','Pig Nose':'🐽','Ram':'🐏','Ewe':'🐑','Goat':'🐐','Camel':'🐪','Bactrian Camel':'🐫','Llama':'🦙','Giraffe':'🦒','Elephant':'🐘','Mammoth':'🦣','Rhinoceros':'🦏','Hippopotamus':'🦛','Mouse Face':'🐭','Mouse':'🐁','Rat':'🐀','Hamster':'🐹','Rabbit Face':'🐰','Rabbit':'🐇','Chipmunk':'🐿️','Beaver':'🦫','Hedgehog':'🦔','Bat':'🦇','Bear':'🐻','Polar Bear':'🐻‍❄️','Koala':'🨨','Panda':'🐼','Sloth':'🦥','Otter':'🦦','Skunk':'🦨','Kangaroo':'🦘','Badger':'🦡','Paw Prints':'🐾','Turkey':'🦃','Chicken':'🐔','Rooster':'🐓','Hatching Chick':'🐣','Baby Chick':'🐤','Front Facing Baby Chick':'🐥','Bird':'🐦','Penguin':'🐧','Dove':'🕊️','Eagle':'🦅','Duck':'🦆','Swan':'🦢','Owl':'🦉','Dodo':'🦤','Feather':'🪶','Flamingo':'🦩','Peacock':'🦚','Parrot':'🦜','Frog':'🐸','Crocodile':'🐊','Turtle':'🐢','Lizard':'🦎','Snake':'🐍','Dragon Face':'🐲','Dragon':'🐉','Sauropod':'🦕','T-Rex':'🦖','Spouting Whale':'🐳','Whale':'🐋','Dolphin':'🐬','Seal':'🦭','Fish':'🐟','Tropical Fish':'🐠','Blowfish':'🐡','Shark':'🦈','Octopus':'🐙','Sea Anemone':'🪼','Coral':'🪸','Spiral Shell':'🐚','Snail':'🐌','Butterfly':'🦋','Caterpillar':'🐛','Ant':'🐜','Honeybee':'🐝','Beetle':'🪲','Lady Beetle':'🐞','Cricket':'🦗','Spider':'🕷️','Spider Web':'🕸️','Scorpion':'🦂','Mosquito':'🦟','Microbe':'🦠','Bouquet':'💐','Cherry Blossom':'🌸','White Flower':'💮','Rosette':'🏵️','Rose':'🌹','Wilted Flower':'🥀','Hibiscus':'🌺','Sunflower':'🌻','Blossom':'🌼','Tulip':'🌷','Seedling':'🌱','Potted Plant':'🪴','Evergreen Tree':'🌲','Deciduous Tree':'🌳','Palm Tree':'🌴','Cactus':'🌵','Sheaf of Rice':'🌾','Herb':'🌿','Clover':'🍀','Maple Leaf':'🍁','Fallen Leaf':'🍂','Leaf Fluttering in Wind':'🍃','Mushroom':'🍄','Rock':'🪨','Globe Showing Europe-Africa':'🌍','Globe Showing Americas':'🌎','Globe Showing Asia-Australia':'🌏','Full Moon':'🌕'
    }
  },
  'Food': {
    icons: ['🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🥦','🧄','🧅','🥜','🫘','🌰','🍞','🥐','🥖','🫓','🥨','🥯','🥞','🧇','🧀','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫕','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫙','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','🫖','☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🫗','🧊','🥄','🍴','🍽️','🥣','🥡','🥢','🧂'],
    emojis: {
      'Grapes':'🍇','Melon':'🍈','Watermelon':'🍉','Tangerine':'🍊','Lemon':'🍋','Banana':'🍌','Pineapple':'🍍','Mango':'🥭','Red Apple':'🍎','Green Apple':'🍏','Pear':'🍐','Peach':'🍑','Cherries':'🍒','Strawberry':'🍓','Blueberries':'🫐','Kiwi Fruit':'🥝','Tomato':'🍅','Olive':'🫒','Coconut':'🥥','Avocado':'🥑','Eggplant':'🍆','Potato':'🥔','Carrot':'🥕','Ear of Corn':'🌽','Hot Pepper':'🌶️','Bell Pepper':'🫑','Cucumber':'🥒','Leafy Green':'🥬','Broccoli':'🥦','Garlic':'🧄','Onion':'🧅','Peanuts':'🥜','Beans':'🫘','Chestnut':'🌰','Bread':'🍞','Croissant':'🥐','Baguette Bread':'🥖','Flatbread':'🫓','Pretzel':'🥨','Bagel':'🥯','Pancakes':'🥞','Waffle':'🧇','Cheese Wedge':'🧀','Meat on Bone':'🦴','Poultry Leg':'🍗','Cut of Meat':'🥩','Bacon':'🍖','Hot Dog':'🌭','Hamburger':'🍔','French Fries':'🍟','Pizza':'🍕','Pot of Food':'🫕','Taco':'🌮','Burrito':'🌯','Tamale':'🫔','Salad':'🥗','Shallow Pan of Food':'🥘','Canned Food':'🥫','Spaghetti':'🍝','Bowl with Spoon':'🥣','Curry Rice':'🍛','Steaming Bowl':'🍜','Dumpling':'🥟','Oyster':'🦪','Fried Shrimp':'🍤','Cooked Rice':'🍙','Brazilian Nut':'🥜','Butter':'🧈','Ice Cream':'🍨','Shaved Ice':'🍦','Cake':'🍰','Birthday Cake':'🎂','Shortcake':'🍮','Candy':'🍭','Lollipop':'🍬','Chocolate Bar':'🍫','Popcorn':'🍿','Doughnut':'🍩','Cookie':'🍪','Honey Pot':'🍯','Bottle with Popping Cork':'🍾','Glass of Milk':'🥛','Milk Cartons':'🍼','Teapot':'🫖','Hot Beverage':'☕','Teacup without Handle':'🍵','Cartwheeling':'🤸'
    }
  },
  'Activities': {
    icons: ['🎃','🎄','🎆','🎇','🧨','✨','🎈','🎉','🎊','🎋','🎍','🎎','🎏','🎐','🎑','🧧','🎀','🎁','🎗️','🎟️','🎫','🎖️','🏆','🏅','🥇','🥈','🥉','⚽','⚾','🥎','🏀','🏐','🏈','🏉','🎾','🥏','🎳','🏏','🏑','🏒','🥍','🏓','🏸','🥊','🥋','🥅','⛳','⛸️','🎣','🤿','🎽','🎿','🛷','🥌','🎯','🪀','🪁','🎱','🔮','🪄','🧿','🪬','🎮','🕹️','🎰','🎲','🧩','🧸','🪅','🪆','♠️','♥️','♦️','♣️','🃏','🀄','🎴','🎭','🖼️','🎨','🧵','🪡','🧶','🪢'],
    emojis: {
      'Jack-O-Lantern':'🎃','Christmas Tree':'🎄','Fireworks':'🎆','Sparkler':'🎇','Firecracker':'🧨','Sparkles':'✨','Balloon':'🎈','Party Popper':'🎉','Confetti Ball':'🎊','Tanabata Tree':'🎋','Pine Decoration':'🎍','Japanese Dolls':'🎎','Carp Streamer':'🎏','Wind Chime':'🎐','Moon Viewing Ceremony':'🎑','Red Envelope':'🧧','Ribbons':'🎀','Wrapped Gift':'🎁','Reminder Ribbon':'🎗️','Admission Tickets':'🎟️','Ticket':'🎫','Military Medal':'🎖️','Trophy':'🏆','Sports Medal':'🏅','1st Place Medal':'🥇','2nd Place Medal':'🥈','3rd Place Medal':'🥉','Soccer Ball':'⚽','Baseball':'⚾','Softball':'🥎','Basketball':'🏀','Volleyball':'🏐','American Football':'🏈','Rugby Football':'🏉','Tennis':'🎾','Flying Disc':'🥏','Bowling':'🎳','Cricket Game':'🏏','Field Hockey':'🏑','Ice Hockey':'🏒','Lacrosse':'🥍','Ping Pong':'🏓','Badminton':'🏸','Boxing Glove':'🥊','Martial Arts Uniform':'🥋','Goal Net':'🥅','Golf':'⛳','Ice Skate':'⛸️','Fishing Pole':'🎣','Diving Mask':'🤿','Running Shirt':'🎽','Skis':'🎿','Sled':'🛷','Curling Stone':'🥌','Direct Hit':'🎯','Yo-Yo':'🪀','Kite':'🪁','Pool 8 Ball':'🎱','Crystal Ball':'🔮','Magic Wand':'🪄','Nazar Amulet':'🧿','Hamsa':'🪬','Video Game':'🎮','Joystick':'🕹️','Slot Machine':'🎰','Game Die':'🎲','Jigsaw':'🧩',      'Teddy Bear':'🧸','Pinata':'🪅','Nesting Dolls':'🪆','Spade Suit':'♠️','Heart Suit':'♥️','Diamond Suit':'♦️','Club Suit':'♣️','Joker':'🃏','Mahjong Red Dragon':'🀄','Flower Playing Cards':'🎴','Performing Arts':'🎭','Framed Picture':'🖼️','Artist Palette':'🎨','Thread':'🧵','Threading Needle':'🪡','Yarn':'🧶','Knot':'🪢'
    }
  },
  'Travel': {
    icons: ['🚀','🛸','🌍','🗺️','🧭','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🪨','🪵','🛖','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','♨️','🎠','🛝','🎡','🎢','💈','🎪','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🛎️','🧳','⌛','⏳','⌚','⏰','🛫','🛬','🛩️','✈️','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🚤','⛵','🛶','🗼'],
    emojis: {
      'Rocket':'🚀','Flying Saucer':'🛸','Globe Showing Europe-Africa':'🌍','World Map':'🗺️','Compass':'🧭','Snow Capped Mountain':'🏔️','Mountain':'⛰️','Volcano':'🌋','Mount Fuji':'🗻','Camping':'🏕️','Beach with Umbrella':'🏖️','Desert':'🏜️','Desert Island':'🏝️','National Park':'🏞️','Stadium':'🏟️','Classical Building':'🏛️','Building Construction':'🏗️','Brick':'🧱','Rock':'🪨','Wood':'🪵','Hut':'🛖','Household Buildings':'🏘️','Derelict House':'🏚️','House':'🏠','House with Garden':'🏡','Office Building':'🏢','Japanese Post Office':'🏣','Post Office':'🏤','Hospital':'🏥','Bank':'🏦','Hotel':'🏨','Love Hotel':'🏩','Convenience Store':'🏪','School':'🏫','Department Store':'🏬','Factory':'🏭','Japanese Castle':'🏯','Castle':'🏰','Wedding':'💒','Tokyo Tower':'🗼','Statue of Liberty':'🗽','Church':'⛪','Mosque':'🕌','Hindu Temple':'🛕','Synagogue':'🕍','Shinto Shrine':'⛩️','Kaaba':'🕋','Fountain':'⛲','Tent':'⛺','Foggy':'🌁','Night with Stars':'🌃','Cityscape':'🏙️','Sunrise over Mountains':'🌄','Sunrise':'🌅','City Sunset':'🌆','Sunset':'🌇','Bridge at Night':'🌉','Hot Springs':'♨️','Carousel Horse':'🎠','Playground Slide':'🛝','Ferris Wheel':'🎡','Roller Coaster':'🎢','Barber Pole':'💈','Circus Tent':'🎪','Locomotive':'🚂','Railway Car':'🚃','High-Speed Train':'🚄','Bullet Train':'🚅','Train':'🚆','Metro':'🚇','Light Rail':'🚈','Station':'🚉','Tram':'🚊','Monorail':'🚝','Mountain Railway':'🚞','Tram Car':'🚋','Bus':'🚌','Oncoming Bus':'🚍','Trolleybus':'🚎','Minibus':'🚐','Ambulance':'🚑','Fire Engine':'🚒','Police Car':'🚓','Oncoming Police Car':'🚔','Taxi':'🚕','Oncoming Taxi':'🚖','Automobile':'🚗','Sport Utility Vehicle':'🚘','Pickup Truck':'🚙','Luggage':'🧳','Hourglass Done':'⌛','Hourglass Not Done':'⏳','Pocket Watch':'⌚','Alarm Clock':'⏰','Aircraft Departure':'🛫','Aircraft Arrival':'🛬','Small Airplane':'🛩️','Airplane':'✈️','Parachute':'🪂','Seat':'💺','Helicopter':'🚁','Suspension Railway':'🚟','Mountain Cableway':'🚠','Aerial Tramway':'🚡','Satellite':'🛰️'
    }
  },
  'Objects': {
    icons: ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💽','💾','💿','📀','🧮','🎥','📸','📹','📼','🔍','🔎','🕯️','💡','🔦','🏮','🪔','📔','📕','📖','📗','📘','📙','📚','📓','📒','📃','📜','📄','📰','🗞️','📑','🔖','🏷️','💰','💴','💵','💶','💷','🪙','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧲','🔫','💣','🧨','🪓','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','🪬','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','🩻','🩼','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🪠','🚽','🚰','🚿','🛁','🛀','🧼','🪒','🧽','🪣','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐','🧧'],
    emojis: {
      'Watch':'⌚','Mobile Phone':'📱','Mobile Phone with Arrow':'📲','Laptop':'💻','Keyboard':'⌨️','Desktop Computer':'🖥️','Printer':'🖨️','Computer Mouse':'🖱️','Trackball':'🖲️','Minidisc':'💽','Floppy Disk':'💾','Optical Disk':'💿','DVD':'📀','Abacus':'🧮','Movie Camera':'🎥','Photographic Camera':'📸','Video Camera':'📹','Videocassette':'📼','Magnifying Glass Tilted Left':'🔍','Magnifying Glass Tilted Right':'🔎','Candle':'🕯️','Light Bulb':'💡','Flashlight':'🔦','Red Paper Lantern':'🏮','Oil Lamp':'🪔','Notebook with Decorative Cover':'📔','Closed Book':'📕','Open Book':'📖','Green Book':'📗','Blue Book':'📘','Orange Book':'📙','Books':'📚','Notebook':'📓','Ledger':'📒','Page with Curl':'📃','Scroll':'📜','Page Facing Up':'📄','Newspaper':'📰','Rolled-Up Newspaper':'🗞️','Bookmark Tabs':'📑','Bookmark':'🔖','Label':'🏷️','Money Bag':'💰','Yen Banknote':'💴','Dollar Banknote':'💵','Euro Banknote':'💶','Pound Banknote':'💷','Coin':'🪙','Credit Card':'💳','Gem Stone':'💎','Balance Scale':'⚖️','Ladder':'🪜','Box':'📦','Package':'📦','Postal Horn':'📮','Nesting Dolls':'🪆'
    }
  },
  'Symbols': {
    icons: ['💌','💘','💝','💖','💗','💓','💞','💕','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💯','💢','💥','💫','💦','💨','🕳️','💣','💬','👁️‍🗨️','🗨️','🗯️','💭','💤','👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵','🐵','🐒','🦍','🦧','🐶','🐺','🦊','🦝','🐱','🦁','🐯','🐅','🐆','🐴','🦄','🦓','🦌','🐮','🐷','🐗','🐏','🐑','🐐','🐪','🐫','🦙','🦒','🐘','🦏','🦛','🐭','🐹','🐰','🐇','🐻','🐨','🐼','🐾','🐔','🐣','🐤','🐥','🐦','🐧','🕊️','🦅','🦆','🦢','🦉','🦜','🐸','🐊','🐢','🐍','🐲','🐉','🦕','🦖','🐳','🐋','🐬','🐟','🐠','🐡','🦈','🐙','🐚','🐌','🦋','🐛','🐜','🐝','🐞','🦗','🕷️','🕸️','🦂','🦟','🦠','💐','🌸','💮','🏵️','🌹','🥀','🌺','🌻','🌼','🌷','🌱','🌲','🌳','🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🌍','🌎','🌏','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌚','🌛','🌜','☀️','🌝','🌞','⭐','🌟','💫','🌠','🌌','☁️','⛅','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌪️','🌫️','🌊','💧','💦','☔','☂️','⚡'],
    emojis: {
      'Love Letter':'💌','Heart with Arrow':'💘','Heart with Ribbon':'💝','Sparkling Heart':'💖','Growing Heart':'💗','Beating Heart':'💓','Revolving Hearts':'💞','Two Hearts':'💕','Heart Decoration':'💟','Heavy Heart Exclamation':'❣️','Broken Heart':'💔','Red Heart':'❤️','Orange Heart':'🧡','Yellow Heart':'💛','Green Heart':'💚','Blue Heart':'💙','Purple Heart':'💜','Brown Heart':'🤎','Black Heart':'🖤','White Heart':'🤍','100':'💯','Anger Symbol':'💢','Collision':'💥','Dizzy':'💫','Sweat Droplets':'💦','Dashing Away':'💨','Hole':'🕳️','Bomb':'💣','Speech Balloon':'💬','Eye in Speech Bubble':'👁️‍🗨️','Left Speech Bubble':'🗨️','Right Anger Bubble':'🗯️','Thought Balloon':'💭','Zzz':'💤'
    }
  },
  'Flags': {
    icons: ['🏁','🚩','🎌','🏴','🏳️','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️','🇺🇸','🇬🇧','🇨🇦','🇫🇷','🇩🇪','🇮🇹','🇪🇸','🇯🇵','🇰🇷','🇨🇳','🇧🇷','🇮🇳','🇲🇽️','🇷🇺','🇦🇺','🇿🇦','🇲🇦','🇸🇳','🇨🇮','🇨🇲'],
    emojis: {
      'Chequered Flag':'🏁','Crossed Flags':'🎌','Black Flag':'🏴','White Flag':'🏳️','Rainbow Flag':'🏳️‍🌈','Transgender Flag':'🏳️‍⚧️','Pirate Flag':'🏴‍☠️','Flag of USA':'🇺🇸','Flag of UK':'🇬🇧','Flag of Canada':'🇨🇦','Flag of France':'🇫🇷','Flag of Germany':'🇩🇪','Flag of Italy':'🇮🇹','Flag of Spain':'🇪🇸','Flag of Japan':'🇯🇵','Flag of South Korea':'🇰🇷','Flag of China':'🇨🇳','Flag of Brazil':'🇧🇷','Flag of India':'🇮🇳','Flag of Mexico':'🇲🇽️','Flag of Russia':'🇷🇺','Flag of Australia':'🇦🇺','Flag of South Africa':'🇿🇦','Flag of Morocco':'🇲🇦',      'Flag of Senegal':'🇸🇳','Flag of Cote d\'Ivoire':'🇨🇮','Flag of Cameroon':'🇨🇲'
    }
  }
};

let cachedTofuData = null;

function isEmojiSupported(emoji) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return true;

    ctx.font = '14px sans-serif';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    if (!cachedTofuData) {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillText('\u{1efff}', 0, 0); // Known unassigned/unsupported character
      cachedTofuData = ctx.getImageData(0, 0, 16, 16).data.toString();
    }

    ctx.clearRect(0, 0, 16, 16);
    ctx.fillText(emoji, 0, 0);
    const emojiImageData = ctx.getImageData(0, 0, 16, 16).data;
    const emojiDataStr = emojiImageData.toString();

    // If it renders identically to the tofu fallback, it is not supported
    if (emojiDataStr === cachedTofuData) {
      return false;
    }

    // Verify it renders at least one non-transparent pixel
    let hasPixels = false;
    for (let i = 3; i < emojiImageData.length; i += 4) {
      if (emojiImageData[i] > 0) {
        hasPixels = true;
        break;
      }
    }
    return hasPixels;
  } catch (e) {
    return true;
  }
}

let filteredEmojiData = null;

function getFilteredEmojiData() {
  if (filteredEmojiData) return filteredEmojiData;

  const result = {};
  for (const [category, data] of Object.entries(EMOJI_DATA)) {
    const matchedEmojis = {};
    const icons = [];
    for (const [name, emoji] of Object.entries(data.emojis)) {
      if (isEmojiSupported(emoji)) {
        matchedEmojis[name] = emoji;
        icons.push(emoji);
      }
    }
    if (Object.keys(matchedEmojis).length > 0) {
      result[category] = {
        icons,
        emojis: matchedEmojis,
      };
    }
  }

  filteredEmojiData = result;
  return result;
}

export default function EmojiPicker({ onEmojiSelect, onClose }) {
  const [search, setSearch] = useState('');
  const emojiData = getFilteredEmojiData();
  const [activeCategory, setActiveCategory] = useState(() => Object.keys(emojiData)[0] || '');
  const pickerRef = useRef(null);
  const searchRef = useRef(null);
  const emojiGridRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    emojiGridRef.current?.scrollTo({ top: 0 });
  }, [activeCategory]);

  const filteredCategories = {};
  
  if (search.trim()) {
    const lowerSearch = search.toLowerCase();
    for (const [category, data] of Object.entries(emojiData)) {
      const matchedEmojis = {};
      for (const [name, emoji] of Object.entries(data.emojis)) {
        if (name.toLowerCase().includes(lowerSearch)) {
          matchedEmojis[name] = emoji;
        }
      }
      if (Object.keys(matchedEmojis).length > 0) {
        filteredCategories[category] = { emojis: matchedEmojis };
      }
    }
  } else {
    if (activeCategory) {
      filteredCategories[activeCategory] = emojiData[activeCategory];
    }
  }

  const allCategories = Object.keys(emojiData);
  const categories = search.trim() ? Object.keys(filteredCategories) : allCategories;
  const currentCategory = search.trim() ? categories[0] : activeCategory;
  const currentEmojis = filteredCategories[currentCategory]?.emojis || {};

  return (
    <div ref={pickerRef} className="emoji-picker">
      <input
        ref={searchRef}
        type="text"
        className="emoji-search"
        placeholder="Search emoji..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      
      <div className="emoji-categories">
        {(search.trim() ? categories : allCategories).map(cat => (
          <button
            key={cat}
            className={`emoji-category-btn ${!search.trim() && activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            title={cat}
          >
            {cat === 'Smilies' && '😀'}
            {cat === 'Gestures' && '👋'}
            {cat === 'People' && '👶'}
            {cat === 'Nature' && '🐵'}
            {cat === 'Food' && '🍇'}
            {cat === 'Activities' && '🎃'}
            {cat === 'Travel' && '🚀'}
            {cat === 'Objects' && '⌚'}
            {cat === 'Symbols' && '💌'}
            {cat === 'Flags' && '🏁'}
          </button>
        ))}
      </div>

      <div ref={emojiGridRef} className="emoji-grid">
        {Object.entries(currentEmojis).map(([name, emoji]) => (
          <button
            key={name}
            className="emoji-item"
            onClick={() => onEmojiSelect(emoji)}
            title={name}
            aria-label={name}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
