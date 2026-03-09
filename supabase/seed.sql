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
'[Passage text coming soon] Jesus teaches about the deeper meaning of the law, anger, adultery, divorce, oaths, retaliation, and loving enemies.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 7, 'Matthew 6:1-18',
'[Passage text coming soon] Jesus teaches on giving, prayer (including the Lord''s Prayer), and fasting — doing righteous acts for God, not for human approval.',
true, 'Week 1 complete! You''ve covered the Sermon on the Mount. Keep going!'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 8, 'Matthew 6:19-34',
'[Passage text coming soon] Jesus teaches about treasures in heaven, the eye as a lamp, serving two masters, and not worrying about tomorrow.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 9, 'Matthew 7:1-29',
'[Passage text coming soon] Jesus teaches on judging others, asking God, the golden rule, the narrow gate, false prophets, and building on rock.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 10, 'Matthew 8:1-34',
'[Passage text coming soon] Jesus heals a man with leprosy, a centurion''s servant, Peter''s mother-in-law, and many others. He calms the storm and heals two demon-possessed men.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 11, 'Matthew 9:1-38',
'[Passage text coming soon] Jesus heals a paralyzed man, calls Matthew, heals a dead girl and a bleeding woman, restores sight to two blind men, and sends workers into the harvest.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 12, 'Matthew 10:1-42',
'[Passage text coming soon] Jesus sends out the Twelve apostles with instructions for their mission — what to preach, expect, and how to stand firm.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 13, 'Matthew 11:1-30',
'[Passage text coming soon] John the Baptist sends messengers to Jesus. Jesus speaks about John, rebukes unrepentant towns, and offers rest to the weary.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 14, 'Matthew 12:1-50',
'[Passage text coming soon] Controversy over the Sabbath, the Pharisees plot to kill Jesus, blasphemy against the Holy Spirit, and Jesus defines his true family.',
true, 'Halfway through week 2! Jesus is revealing who he truly is — keep reading!'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 15, 'Matthew 13:1-58',
'[Passage text coming soon] The Parable of the Sower, weeds, mustard seed, yeast, hidden treasure, pearls, and the net. Jesus is rejected at Nazareth.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 16, 'Matthew 14:1-36',
'[Passage text coming soon] John the Baptist is beheaded. Jesus feeds 5,000 and walks on water.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 17, 'Matthew 15:1-39',
'[Passage text coming soon] Clean and unclean. Faith of a Canaanite woman. Jesus heals many and feeds 4,000.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 18, 'Matthew 16:1-28',
'[Passage text coming soon] The demand for a sign. Peter''s confession of Christ. Jesus predicts his death. "Take up your cross."',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 19, 'Matthew 17:1-27',
'[Passage text coming soon] The Transfiguration. Jesus heals a demon-possessed boy. Second prediction of his death. The temple tax.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 20, 'Matthew 18:1-35',
'[Passage text coming soon] The greatest in the kingdom. Lost sheep. Confronting sin. Unlimited forgiveness. Parable of the unmerciful servant.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 21, 'Matthew 19:1-30',
'[Passage text coming soon] Divorce. Little children. Rich young ruler. The eye of a needle. The first will be last.',
true, '3 weeks in! You''re doing amazing. The final stretch is Jesus'' last week before the cross.'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 22, 'Matthew 20:1-34',
'[Passage text coming soon] Workers in the vineyard. Third prediction of death. Serving like Jesus — a ransom for many.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 23, 'Matthew 21:1-46',
'[Passage text coming soon] The Triumphal Entry. Clearing the temple. The fig tree withers. Authority questioned. Parables of the two sons and the tenants.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 24, 'Matthew 22:1-46',
'[Passage text coming soon] Parable of the wedding banquet. Taxes to Caesar. Marriage at the resurrection. The greatest commandment. Whose son is the Messiah?',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 25, 'Matthew 23:1-39',
'[Passage text coming soon] Seven woes against the Pharisees. Jerusalem''s lament. "You will not see me again until you say, Blessed is he who comes in the name of the Lord."',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 26, 'Matthew 24:1-51',
'[Passage text coming soon] Signs of the end of the age. The abomination of desolation. The coming of the Son of Man. The fig tree parable. Stay awake.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 27, 'Matthew 25:1-46',
'[Passage text coming soon] Parables of the ten virgins, talents, and sheep and goats. "Whatever you did for one of the least of these brothers and sisters of mine, you did for me."',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 28, 'Matthew 26:1-75',
'[Passage text coming soon] The Last Supper. Gethsemane. Betrayal and arrest. Jesus before the Sanhedrin. Peter''s denial.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 29, 'Matthew 27:1-66',
'[Passage text coming soon] Judas hangs himself. Jesus before Pilate. The crucifixion. The death of Jesus. The burial.',
false, null),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 30, 'Matthew 28:1-20',
'[Passage text coming soon] The Resurrection. The Great Commission: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age."',
true, 'Quest Complete! You''ve journeyed through all of Matthew. "And surely I am with you always." — Matthew 28:20')

ON CONFLICT DO NOTHING;
