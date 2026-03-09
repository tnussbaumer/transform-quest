-- ============================================================
-- Transform Quest — Seed Data
-- "Journey Through Matthew" — 30-day reading quest
-- Run this AFTER both migration files.
-- ============================================================

-- Insert the quest
INSERT INTO public.quests (id, title, description, start_date, end_date, quest_type, is_active, badge_name, badge_icon)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Journey Through Matthew',
  'Explore the Gospel of Matthew over 30 days. Discover who Jesus is, what he taught, and what he requires of his followers.',
  '2026-03-01',
  '2026-03-30',
  'reading',
  true,
  'Matthew Explorer',
  'compass'
)
ON CONFLICT DO NOTHING;

-- Insert 30 quest days
-- Days 1-5 have full passage text; days 6-30 have placeholder text
-- Milestones on days 7, 14, 21, 30

INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note)
VALUES

-- DAY 1
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'Matthew 1:1-25',
'A record of the genealogy of Jesus the Messiah the son of David, the son of Abraham: Abraham was the father of Isaac, Isaac the father of Jacob, Jacob the father of Judah and his brothers, Judah the father of Perez and Zerah, whose mother was Tamar... All this took place to fulfill what the Lord had said through the prophet: "The virgin will conceive and give birth to a son, and they will call him Immanuel" (which means "God with us"). When Joseph woke up, he did what the angel of the Lord had commanded him and took Mary home as his wife. But he did not consummate their marriage until she gave birth to a son. And he gave him the name Jesus.',
false, null),

-- DAY 2
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 'Matthew 2:1-23',
'After Jesus was born in Bethlehem in Judea, during the time of King Herod, Magi from the east came to Jerusalem and asked, "Where is the one who has been born king of the Jews? We saw his star when it rose and have come to worship him." When King Herod heard this he was disturbed, and all Jerusalem with him... And having been warned in a dream not to go back to Herod, they returned to their country by another route. When they had gone, an angel of the Lord appeared to Joseph in a dream. "Get up," he said, "take the child and his mother and escape to Egypt. Stay there until I tell you, for Herod is going to search for the child to kill him."',
false, null),

-- DAY 3
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 'Matthew 3:1-17',
'In those days John the Baptist came, preaching in the wilderness of Judea and saying, "Repent, for the kingdom of heaven has come near." This is he who was spoken of through the prophet Isaiah: "A voice of one calling in the wilderness, ''Prepare the way for the Lord, make straight paths for him.''"... As soon as Jesus was baptized, he went up out of the water. At that moment heaven was opened, and he saw the Spirit of God descending like a dove and alighting on him. And a voice from heaven said, "This is my Son, whom I love; with him I am well pleased."',
false, null),

-- DAY 4
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, 'Matthew 4:1-25',
'Then Jesus was led by the Spirit into the wilderness to be tempted by the devil. After fasting forty days and forty nights, he was hungry. The tempter came to him and said, "If you are the Son of God, tell these stones to become bread." Jesus answered, "It is written: ''Man shall not live on bread alone, but on every word that comes from the mouth of God.''"... Jesus went throughout Galilee, teaching in their synagogues, proclaiming the good news of the kingdom, and healing every disease and sickness among the people.',
false, null),

-- DAY 5
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5, 'Matthew 5:1-16',
'Now when Jesus saw the crowds, he went up on a mountainside and sat down. His disciples came to him, and he began to teach them. He said: "Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they will be comforted. Blessed are the meek, for they will inherit the earth. Blessed are those who hunger and thirst for righteousness, for they will be filled. Blessed are the merciful, for they will be shown mercy. Blessed are the pure in heart, for they will see God. Blessed are the peacemakers, for they will be called children of God."... "You are the light of the world. A town built on a hill cannot be hidden. Neither do people light a lamp and put it under a bowl. Instead they put it on its stand, and it gives light to everyone in the house. In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven."',
false, null),

-- DAYS 6-30: real passage references, placeholder text
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 6, 'Matthew 5:17-48',
'Jesus makes clear he has not come to abolish the Law but to fulfill it. He raises the bar far beyond the religious rules of the day: anger is treated as seriously as murder, lust as seriously as adultery. He calls his followers to a transformed heart, not just outward rule-keeping. His teaching culminates in a radical command: "Love your enemies and pray for those who persecute you." He calls us to reflect the character of our heavenly Father, who shows kindness even to the ungrateful.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 7, 'Matthew 6:1-18',
'Jesus warns against performing religious acts to be seen by others. Whether giving to the poor, praying, or fasting — the motive matters. He teaches his disciples the Lord''s Prayer: a simple, honest conversation with a Father who already knows what we need. The goal is intimacy with God, not performance for people. "Your Father, who sees what is done in secret, will reward you."',
true, 'Week 1 complete! You''ve covered the Sermon on the Mount. Keep going!'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 8, 'Matthew 6:19-34',
'Jesus addresses the anxiety that comes from trying to secure our own future. He calls us not to store up earthly treasure that can rust and rot, but to invest in things that last. "The eye is the lamp of the body" — what we focus on shapes us. He closes with one of his most comforting commands: "Do not worry about tomorrow." Our heavenly Father feeds birds and clothes wildflowers; he will certainly take care of us. "Seek first his kingdom and his righteousness, and all these things will be given to you."',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 9, 'Matthew 7:1-29',
'The Sermon on the Mount reaches its conclusion with a series of vivid contrasts. Jesus warns against hypocritical judging — examining the speck in another''s eye while ignoring the plank in your own. He invites persistent prayer: "Ask and it will be given to you." He describes the narrow gate that leads to life and warns against false prophets known by their fruit. The sermon ends powerfully: the one who hears these words and puts them into practice is like a man who builds his house on rock — unshakeable when the storms come.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 10, 'Matthew 8:1-34',
'Jesus steps down from the mountain and immediately demonstrates his authority through healing. A man with leprosy — untouchable by law — is healed with a touch. A Roman centurion''s servant is healed from a distance, prompting Jesus to marvel at the man''s faith. Peter''s mother-in-law is healed of fever. Then, on the stormy sea, Jesus rebukes the wind and waves with a word. His disciples ask in awe: "What kind of man is this?" Even the demons recognize who he is.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 11, 'Matthew 9:1-38',
'Jesus heals a paralyzed man — but first forgives his sins, which shocks the religious leaders. He calls Matthew, a tax collector, to follow him and then eats with sinners. "It is not the healthy who need a doctor, but the sick." He raises a dead girl, heals a bleeding woman, and gives sight to two blind men. Looking at the crowds — harassed and helpless like sheep without a shepherd — Jesus is moved with compassion. He urges his disciples to pray for workers in the harvest.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 12, 'Matthew 10:1-42',
'Jesus sends out his twelve apostles with clear instructions: heal the sick, raise the dead, drive out demons, preach the kingdom — and don''t charge for it. He warns them of coming opposition: they will be like sheep among wolves. But he also reassures them. The Father knows when a sparrow falls; he will certainly guard his people. "Whoever acknowledges me before others, I will also acknowledge before my Father in heaven." The mission is costly, but worth it.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 13, 'Matthew 11:1-30',
'John the Baptist, now in prison, sends messengers to ask if Jesus really is the one. Jesus points to the evidence: the blind see, the lame walk, the dead are raised. He then mourns over towns that witnessed miracles yet refused to repent. But in the midst of that grief comes one of the most beautiful invitations in all of Scripture: "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart."',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 14, 'Matthew 12:1-50',
'Conflict with the Pharisees escalates. They accuse Jesus of breaking the Sabbath and attribute his miracles to the devil. Jesus exposes their hypocrisy: "Every kingdom divided against itself will be ruined." He warns solemnly against blaspheming the Holy Spirit — attributing God''s work to evil. When his mother and brothers come looking for him, Jesus redefines family: "Whoever does the will of my Father in heaven is my brother and sister and mother." True belonging comes through obedience and trust.',
true, 'Halfway through week 2! Jesus is revealing who he truly is — keep reading!'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 15, 'Matthew 13:1-58',
'Jesus teaches in parables — short stories with hidden depth. The Parable of the Sower describes different responses to God''s word. Some people hear it and it''s immediately stolen; others receive it with joy but fall away; others let worries choke it out; and some let it take root and produce an extraordinary harvest. The kingdom of heaven is like a mustard seed — tiny at first, but it grows into something remarkable. Jesus is rejected in his hometown, a reminder that familiarity can breed unbelief.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 16, 'Matthew 14:1-36',
'Herod has John the Baptist beheaded to keep a foolish promise made at a party. When Jesus hears the news, he withdraws — but the crowds follow him. Moved with compassion, he heals the sick and then feeds over five thousand people with just five loaves and two fish. Later that night, he walks on water toward the disciples'' storm-tossed boat. Peter steps out and walks on water toward Jesus — until his eyes shift to the wind and he sinks. "Why did you doubt?" Jesus asks, reaching out his hand.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 17, 'Matthew 15:1-39',
'The Pharisees challenge Jesus about hand-washing rituals. Jesus cuts to the heart: "What goes into someone''s mouth does not defile them, but what comes out of their mouth, that is what defiles them." A Canaanite woman — a Gentile — approaches Jesus begging for her demon-possessed daughter''s healing. Her persistence and faith are extraordinary, and Jesus honors both: "Woman, you have great faith! Your request is granted." He heals many more and then feeds four thousand people on another hillside.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 18, 'Matthew 16:1-28',
'The turning point of Matthew''s Gospel. Peter declares, "You are the Messiah, the Son of the living God." Jesus affirms this and announces he will build his church. But immediately after, when Jesus predicts his death, Peter rebukes him — and is sharply corrected: "Get behind me, Satan." Jesus explains the paradox at the heart of discipleship: "Whoever wants to save their life will lose it, but whoever loses their life for me will find it." The kingdom demands everything, and gives back far more.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 19, 'Matthew 17:1-27',
'Six days after Peter''s confession, Jesus takes Peter, James, and John up a high mountain. There he is transfigured — his face shining like the sun, Moses and Elijah appearing beside him. A voice from a cloud says, "This is my Son, whom I love; with him I am well pleased. Listen to him!" When they come down, the disciples fail to heal a demon-possessed boy because of their little faith. Jesus heals the boy with a word. "Nothing will be impossible for you," he tells them.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 20, 'Matthew 18:1-35',
'The disciples ask who is greatest in the kingdom. Jesus puts a child in their midst: humility is the entry point. He speaks about caring for vulnerable believers and confronting sin with gentleness. Peter asks how many times he must forgive — seven times? Jesus says seventy-seven times. Then he tells a parable about a servant forgiven an astronomical debt who refuses to forgive a small debt owed to him. The master''s response is severe: unmerciful servants will face unmerciful judgment.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 21, 'Matthew 19:1-30',
'Jesus is tested on the question of divorce and upholds the permanence of marriage as God''s original design. He welcomes little children when the disciples try to turn them away: "The kingdom of heaven belongs to such as these." A rich young man asks what he must do to inherit eternal life. He has kept the commandments — but when Jesus says to sell everything and give to the poor, he walks away. "With man this is impossible," Jesus says, "but with God all things are possible."',
true, '3 weeks in! You''re doing amazing. The final stretch is Jesus'' last week before the cross.'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 22, 'Matthew 20:1-34',
'A parable about workers in a vineyard challenges our sense of fairness: the owner pays latecomers the same as those who worked all day. The kingdom of God runs on grace, not merit. Jesus predicts his death and resurrection a third time. James and John''s mother asks for the top seats for her sons — Jesus redirects them: "Whoever wants to become great among you must be your servant." As they leave Jericho, two blind men cry out; Jesus heals them immediately.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 23, 'Matthew 21:1-46',
'Jesus enters Jerusalem to shouts of "Hosanna!" riding on a donkey, fulfilling prophecy. He drives out the moneychangers from the temple: "My house will be called a house of prayer, but you are making it a den of robbers." He curses a fig tree and it withers — a sign of judgment on fruitless religion. When the chief priests challenge his authority, Jesus responds with parables that expose them: they have rejected the cornerstone, and the kingdom will be taken from them.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 24, 'Matthew 22:1-46',
'Jesus tells a parable about a king''s wedding banquet: the invited guests refuse to come, so the invitation goes out to everyone. The religious leaders try to trap Jesus with questions about taxes, the resurrection, and the greatest commandment. His answer to the last is definitive: love God with everything you have, and love your neighbor as yourself. Then Jesus turns the tables with a question about the Messiah''s identity that silences them all.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 25, 'Matthew 23:1-39',
'Jesus pronounces seven woes on the scribes and Pharisees. They are hypocrites: they say one thing and do another. They load people down with burdens but won''t lift a finger to help. They clean the outside of the cup while the inside is full of greed. They are like whitewashed tombs — beautiful on the outside, dead on the inside. Jesus ends with a lament over Jerusalem: "How often I have longed to gather your children together, as a hen gathers her chicks under her wings, and you were not willing."',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 26, 'Matthew 24:1-51',
'Jesus predicts the destruction of the temple and speaks about the signs of the end of the age. There will be wars, famines, earthquakes — but these are only the beginning. The gospel will be preached to all nations. False messiahs will arise and perform signs. The coming of the Son of Man will be as unmistakable as lightning flashing across the sky. No one knows the day or hour. The call is to faithful readiness: "Keep watch, because you do not know on what day your Lord will come."',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 27, 'Matthew 25:1-46',
'Three parables about the coming kingdom and what faithfulness looks like while we wait. The ten virgins: five are prepared with oil, five are not — be ready. The talents: a master entrusts resources to servants, and rewards those who invested them faithfully. The sheep and the goats: the King separates people based on how they treated "the least of these" — the hungry, the stranger, the sick, the imprisoned. "Whatever you did for one of the least of these brothers and sisters of mine, you did for me."',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 28, 'Matthew 26:1-75',
'The final hours before the cross. A woman anoints Jesus with expensive perfume — he says she is preparing him for burial. Judas agrees to betray him for thirty silver coins. At the Passover meal, Jesus takes bread and wine and gives them new meaning: "This is my body... This is my blood of the covenant, which is poured out for many." In Gethsemane he prays in agony, "Yet not as I will, but as you will." He is arrested, tried, and Peter denies him three times. Peter goes out and weeps bitterly.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 29, 'Matthew 27:1-66',
'Judas, filled with remorse, throws the silver coins into the temple and hangs himself. Jesus stands before Pilate, who finds no guilt in him but hands him over to the crowd. He is mocked, beaten, and crucified between two criminals. At noon, darkness covers the land for three hours. At three o''clock Jesus cries out, "My God, my God, why have you forsaken me?" and breathes his last. The curtain of the temple tears in two. A Roman soldier declares, "Surely he was the Son of God." He is buried in a tomb, a stone rolled against the entrance.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 30, 'Matthew 28:1-20',
'Early on the first day of the week, Mary Magdalene and the other Mary go to the tomb. An angel rolls back the stone and tells them: "He is not here; he has risen, just as he said." Jesus himself meets the women on their way and they clasp his feet in worship. He appears to the eleven disciples on a mountain in Galilee. Some worship him; some still doubt. Jesus speaks his final commission: "All authority in heaven and on earth has been given to me. Therefore go and make disciples of all nations... And surely I am with you always, to the very end of the age."',
true, 'Quest Complete! You''ve journeyed through all of Matthew. "And surely I am with you always." — Matthew 28:20')

ON CONFLICT DO NOTHING;
