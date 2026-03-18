-- ============================================================
-- Devotional Summaries for "Luke–Acts: The Gospel Unleashed" (79 days)
-- Run in Supabase SQL Editor AFTER seed_luke_acts.sql
-- These UPDATE the passage_text for each day.
-- Leaders can override these via the admin Quest Builder.
-- ============================================================

-- Helper: update by quest title + day number
-- LUKE (Days 1-44)

UPDATE public.quest_days SET passage_text = 'Luke opens his Gospel like a journalist — he investigated everything carefully so you can be confident in what you believe. Faith isn''t blind; it''s built on real events and real eyewitnesses.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 1;

UPDATE public.quest_days SET passage_text = 'An angel appears to an old priest named Zechariah and promises him a son — John the Baptist. Zechariah doubts it and loses his voice. Sometimes God''s plans are so big they''re hard to believe, but that doesn''t make them any less real.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 2;

UPDATE public.quest_days SET passage_text = 'The angel Gabriel visits a teenage girl named Mary and tells her she''ll be the mother of God''s Son. Mary''s response is incredible: "I am the Lord''s servant." God chose an ordinary girl for the most extraordinary mission in history.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 3;

UPDATE public.quest_days SET passage_text = 'Mary visits her cousin Elizabeth, and the baby inside Elizabeth leaps for joy. Mary sings a song praising God for lifting up the humble and filling the hungry. When God moves, even the unborn can sense it.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 4;

UPDATE public.quest_days SET passage_text = 'John the Baptist is born, and Zechariah gets his voice back. He immediately prophesies about God''s rescue plan. When God restores you, the first thing you''ll want to do is praise Him.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 5;

UPDATE public.quest_days SET passage_text = 'Jesus is born in Bethlehem — in a manger, not a palace. Angels announce it to shepherds, the lowest people in society. God''s greatest gift came in the humblest package. He meets us where we are, not where the world says we should be.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 6;

UPDATE public.quest_days SET passage_text = 'Baby Jesus is brought to the temple where an old man named Simeon and an elderly prophetess named Anna recognize Him as God''s promised Savior. Sometimes the people who see God most clearly are the ones who''ve been waiting the longest.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 7;

UPDATE public.quest_days SET passage_text = 'Twelve-year-old Jesus stays behind at the temple, amazing the teachers with His understanding. When His parents find Him, He says, "Didn''t you know I had to be in my Father''s house?" Even as a kid, Jesus knew exactly who He was and whose He was.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 8;

UPDATE public.quest_days SET passage_text = 'John the Baptist preaches in the wilderness: repent, share what you have, and stop cheating people. Real repentance isn''t just feeling sorry — it''s changing how you live. John was getting people ready for something huge.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 9;

UPDATE public.quest_days SET passage_text = 'Jesus is baptized and the Holy Spirit descends on Him like a dove. God''s voice from heaven declares, "You are my Son, whom I love." Before Jesus does anything public, the Father affirms who He is. Your identity comes from God, not your achievements.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 10;

UPDATE public.quest_days SET passage_text = 'Jesus is led into the wilderness and tempted by the devil for forty days. He fights back with Scripture every time. The enemy will always try to get you to doubt who God says you are — but God''s Word is your strongest defense.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 11;

UPDATE public.quest_days SET passage_text = 'Jesus returns to His hometown and reads from Isaiah: "The Spirit of the Lord is on me to proclaim good news to the poor." Then He says, "Today this Scripture is fulfilled." The people are amazed — then furious. Jesus'' mission was never going to be popular with everyone.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 12;

UPDATE public.quest_days SET passage_text = 'Jesus calls His first disciples by the lake. Peter catches so many fish his nets start breaking, falls to his knees, and says, "Go away from me, Lord; I am a sinful man." Jesus'' response? "Don''t be afraid. From now on you''ll fish for people."'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 13;

UPDATE public.quest_days SET passage_text = 'Jesus calls Levi the tax collector and eats with sinners. The religious leaders complain. Jesus says, "It is not the healthy who need a doctor, but the sick." Jesus didn''t come for perfect people — He came for real ones.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 14;

UPDATE public.quest_days SET passage_text = 'Jesus picks His twelve apostles after a night of prayer, then teaches the crowds. Blessed are the poor, the hungry, those who weep. God''s kingdom values are the opposite of the world''s. What the world calls weakness, God calls strength.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 15;

UPDATE public.quest_days SET passage_text = 'A centurion asks Jesus to heal his servant — but says Jesus doesn''t even need to come to his house. Just say the word. Jesus is amazed by this outsider''s faith. Sometimes the people you least expect show the most trust in God.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 16;

UPDATE public.quest_days SET passage_text = 'A sinful woman crashes a dinner party to wash Jesus'' feet with her tears. The host judges her, but Jesus accepts her. Those who''ve been forgiven much love much. Your past doesn''t disqualify you from God''s love — it amplifies your gratitude.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 17;

UPDATE public.quest_days SET passage_text = 'Jesus calms a storm and the disciples are terrified — not of the storm, but of Him. "Who is this?" they ask. Then He heals a demon-possessed man and sends him home to tell everyone what God did. Jesus has authority over nature, demons, and fear itself.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 18;

UPDATE public.quest_days SET passage_text = 'Jesus sends out the twelve disciples to preach and heal. Then He feeds 5,000 people with five loaves and two fish. God can take whatever little you have and multiply it beyond what you imagined. Just give Him what you''ve got.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 19;

UPDATE public.quest_days SET passage_text = 'Jesus heals a boy with an evil spirit after His disciples couldn''t. He tells them the Son of Man will be betrayed and killed. The disciples don''t understand — and they''re afraid to ask. Following Jesus means trusting Him even when His plan doesn''t make sense yet.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 20;

UPDATE public.quest_days SET passage_text = 'Jesus sets His face toward Jerusalem — He knows what''s waiting for Him there. He sends messengers ahead and tells would-be followers to count the cost. Following Jesus isn''t casual — it''s an all-in commitment.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 21;

UPDATE public.quest_days SET passage_text = 'Jesus tells the parable of the Good Samaritan. A lawyer asks "Who is my neighbor?" and Jesus flips the question: be the neighbor. Love isn''t about drawing boundaries around who deserves your help — it''s about crossing those boundaries.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 22;

UPDATE public.quest_days SET passage_text = 'Jesus teaches His disciples to pray and tells them to keep asking, seeking, and knocking. God isn''t annoyed by your persistence — He rewards it. If earthly fathers give good gifts, how much more will your heavenly Father give?'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 23;

UPDATE public.quest_days SET passage_text = 'Jesus confronts the Pharisees for looking good on the outside while being rotten inside. He calls them unmarked graves — people walk over them without knowing it. God sees through every mask. Authenticity matters more than appearance.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 24;

UPDATE public.quest_days SET passage_text = 'Jesus warns against greed and tells the parable of the rich fool who stored up stuff for himself but wasn''t rich toward God. Life isn''t measured by what you own. The things that matter most can''t fit in a bank account.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 25;

UPDATE public.quest_days SET passage_text = 'Jesus says He came to bring fire and division, not just peace. Following Him will cost you something. He challenges the crowd to read the signs of the times. Comfortable religion wasn''t what Jesus came to offer.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 26;

UPDATE public.quest_days SET passage_text = 'Jesus heals a crippled woman on the Sabbath and the religious leaders lose it. He compares God''s kingdom to a mustard seed and yeast — it starts tiny but grows into something massive. Never underestimate what God can do with something small.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 27;

UPDATE public.quest_days SET passage_text = 'Jesus tells a parable about a great banquet where the invited guests make excuses and don''t show up. So the host invites the poor, the broken, and the outsiders instead. God''s invitation is open to everyone — the only way to miss it is to say no.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 28;

UPDATE public.quest_days SET passage_text = 'Three of Jesus'' most famous parables: the lost sheep, the lost coin, and the lost son. All three celebrate the same thing — heaven throws a party when even one person comes home to God. You are never too lost to be found.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 29;

UPDATE public.quest_days SET passage_text = 'Jesus tells the parable of the shrewd manager and teaches about money. You can''t serve both God and money — you have to choose. How you handle what you''ve been given reveals what you really worship.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 30;

UPDATE public.quest_days SET passage_text = 'Jesus tells the story of the rich man and Lazarus. The rich man ignored the beggar at his gate and paid an eternal price. How you treat the people nobody notices says everything about your heart.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 31;

UPDATE public.quest_days SET passage_text = 'Jesus heals ten lepers, but only one comes back to say thank you — and he''s a Samaritan, an outsider. Jesus asks, "Where are the other nine?" Gratitude reveals the depth of your faith. Don''t forget to thank God for what He''s already done.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 32;

UPDATE public.quest_days SET passage_text = 'A rich ruler asks Jesus what he must do to inherit eternal life. Jesus tells him to sell everything. The man walks away sad. Then Jesus says it''s easier for a camel to go through the eye of a needle than for the rich to enter God''s kingdom. What''s holding you back?'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 33;

UPDATE public.quest_days SET passage_text = 'Jesus tells the parable of the ten minas — servants who are trusted with their master''s money and expected to invest it wisely. God has given you gifts, time, and opportunities. What are you doing with them while you wait for His return?'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 34;

UPDATE public.quest_days SET passage_text = 'Jesus rides into Jerusalem on a donkey as crowds shout "Blessed is the King!" Then He weeps over the city because they don''t recognize what God is doing. He clears the temple in righteous anger. The King has arrived — but not the way anyone expected.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 35;

UPDATE public.quest_days SET passage_text = 'The religious leaders challenge Jesus'' authority and try to trap Him with questions. Jesus responds with a parable about wicked tenants who kill the vineyard owner''s son. The leaders know He''s talking about them — and it makes them furious.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 36;

UPDATE public.quest_days SET passage_text = 'Jesus is asked about paying taxes, the resurrection, and whose son the Messiah is. He silences every critic with perfect wisdom. Then He warns against the teachers of the law who love attention but devour widows'' houses. Watch out for religion that''s all show.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 37;

UPDATE public.quest_days SET passage_text = 'Jesus talks about the destruction of the temple and the signs of the end times. Wars, earthquakes, persecution — but don''t be terrified. Stand firm and you will win life. In a world full of chaos, Jesus says: trust me and don''t give up.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 38;

UPDATE public.quest_days SET passage_text = 'Judas agrees to betray Jesus. At the Last Supper, Jesus breaks bread and shares wine — "This is my body given for you." He knows exactly what''s coming, and He walks toward it willingly. The greatest act of love in history is about to unfold.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 39;

UPDATE public.quest_days SET passage_text = 'In the garden, Jesus prays so intensely His sweat is like drops of blood. "Not my will, but yours be done." He''s arrested, Peter denies Him three times, and the soldiers mock Him. The darkest hours test what you really believe.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 40;

UPDATE public.quest_days SET passage_text = 'Jesus is brought before Pilate and Herod. They find no fault in Him, but the crowd screams for His crucifixion. Pilate caves to the pressure and hands Jesus over. Sometimes the truth gets shouted down — but that doesn''t make it any less true.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 41;

UPDATE public.quest_days SET passage_text = 'Jesus is crucified. He prays, "Father, forgive them — they don''t know what they''re doing." A criminal next to Him asks to be remembered, and Jesus promises him paradise. Even on the cross, Jesus is saving people. His love never stops.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 42;

UPDATE public.quest_days SET passage_text = 'The tomb is empty! Angels tell the women, "He is not here; He has risen!" Two disciples meet the risen Jesus on the road to Emmaus without recognizing Him — until He breaks bread. The resurrection changes everything. Death doesn''t get the final word.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 43;

UPDATE public.quest_days SET passage_text = 'Jesus appears to His disciples, eats with them, and opens their minds to understand Scripture. He commissions them to be witnesses to all nations, starting from Jerusalem. Then He ascends to heaven. The story of Luke ends with a beginning — yours.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 44;

-- ACTS (Days 45-79)

UPDATE public.quest_days SET passage_text = 'Luke picks up where his Gospel left off. Jesus tells His disciples to wait in Jerusalem for the Holy Spirit. Then He ascends to heaven. The disciples replace Judas and pray together. Before God sends you out, sometimes He asks you to wait.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 45;

UPDATE public.quest_days SET passage_text = 'The Holy Spirit arrives like wind and fire on the day of Pentecost. The disciples speak in languages they''ve never learned, and people from every nation hear the gospel. God''s power isn''t polite or predictable — it''s an unstoppable force.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 46;

UPDATE public.quest_days SET passage_text = 'Peter preaches the first sermon in church history and 3,000 people respond. The early church shares everything, eats together, and prays constantly. This is what it looks like when the Holy Spirit is in charge — radical generosity and genuine community.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 47;

UPDATE public.quest_days SET passage_text = 'Peter heals a lame beggar at the temple gate. The man leaps and praises God. Peter makes it clear — this isn''t his power. It''s the name of Jesus. When God works through you, make sure everyone knows who deserves the credit.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 48;

UPDATE public.quest_days SET passage_text = 'Peter and John are arrested for preaching about Jesus. The religious leaders are stunned by their boldness because they''re "unschooled, ordinary men." But they had been with Jesus — and that changes everything. You don''t need a degree to be used by God.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 49;

UPDATE public.quest_days SET passage_text = 'The believers share everything they have. Barnabas sells a field and gives the money to the apostles. But Ananias and Sapphira lie about their gift and face severe consequences. God doesn''t need your money — He wants your honesty.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 50;

UPDATE public.quest_days SET passage_text = 'The apostles perform many signs and wonders. They''re arrested again but an angel breaks them out of jail. The religious leaders are furious, but one wise teacher named Gamaliel says, "If this is from God, you can''t stop it." And he was right.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 51;

UPDATE public.quest_days SET passage_text = 'The church picks seven men to serve tables so the apostles can focus on teaching and prayer. Stephen, full of faith and power, stands out from the rest. God uses servants — people willing to do the unglamorous work that keeps the mission moving.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 52;

UPDATE public.quest_days SET passage_text = 'Stephen gives a bold speech retelling Israel''s entire history and calling out the leaders for resisting the Holy Spirit. They stone him to death — and he dies praying for his killers, just like Jesus did. Stephen becomes the first martyr of the church.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 53;

UPDATE public.quest_days SET passage_text = 'Persecution scatters the believers out of Jerusalem — but everywhere they go, they preach the gospel. Philip brings the good news to Samaria and people respond with joy. What the enemy meant to destroy, God used to spread the message further.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 54;

UPDATE public.quest_days SET passage_text = 'Philip is led by the Spirit to a desert road where he meets an Ethiopian official reading Isaiah but not understanding it. Philip explains the gospel, and the man is baptized on the spot. God sets up divine appointments — be ready for yours.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 55;

UPDATE public.quest_days SET passage_text = 'Saul — the church''s worst enemy — meets the risen Jesus on the road to Damascus and is completely transformed. The persecutor becomes a preacher. If God can change Saul, He can change anyone. Never write someone off.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 56;

UPDATE public.quest_days SET passage_text = 'Peter heals a paralyzed man and raises a woman named Tabitha from the dead. The news spreads and many people believe. God''s power through ordinary people doing extraordinary things — that''s what the book of Acts is all about.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 57;

UPDATE public.quest_days SET passage_text = 'A Roman centurion named Cornelius has a vision, and Peter has a vision too. God is breaking down walls — the gospel isn''t just for Jewish people. The Holy Spirit falls on Gentiles for the first time. God''s love has no ethnic, cultural, or social boundaries.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 58;

UPDATE public.quest_days SET passage_text = 'Peter explains to the church in Jerusalem why he ate with Gentiles and baptized them. When they hear how the Spirit fell on the Gentiles, they praise God: "So then, God has granted even the Gentiles repentance unto life!" The doors of the kingdom are wider than anyone imagined.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 59;

UPDATE public.quest_days SET passage_text = 'King Herod arrests and kills the apostle James, then throws Peter in prison. But the church prays all night, and an angel breaks Peter out. Herod is struck down by God for accepting worship meant only for God. Never underestimate the power of a praying church.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 60;

UPDATE public.quest_days SET passage_text = 'The church in Antioch sends out Barnabas and Saul on the first missionary journey. They sail to Cyprus and preach boldly. A sorcerer tries to stop them, but Paul (Saul''s new name) calls him out. The gospel advances — and nothing can hold it back.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 61;

UPDATE public.quest_days SET passage_text = 'Paul preaches a powerful sermon in a synagogue, tracing God''s plan from the Old Testament to Jesus. Some believe, others reject the message. Paul and Barnabas turn to the Gentiles. When one door closes, God opens another — and it''s usually bigger.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 62;

UPDATE public.quest_days SET passage_text = 'Paul and Barnabas preach, get chased out of towns, and keep going. In Lystra, Paul heals a lame man and the crowd tries to worship them as gods. Paul redirects all the glory to God. Ministry is messy, unpredictable, and always about pointing people to Jesus.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 63;

UPDATE public.quest_days SET passage_text = 'The church faces its first major controversy: do Gentile believers need to follow Jewish laws? The apostles meet in Jerusalem and decide no — salvation is by grace, not by rules. This decision changes everything. The gospel is free, and no one can add requirements to God''s gift.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 64;

UPDATE public.quest_days SET passage_text = 'Paul and Barnabas split up over a disagreement about John Mark. Paul takes Silas on a new journey. Even godly leaders don''t always agree — but God uses both paths. In Philippi, a woman named Lydia becomes the first European convert.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 65;

UPDATE public.quest_days SET passage_text = 'Paul preaches in Athens, standing in the middle of the world''s most intellectual city. He finds common ground with the philosophers but points them to the unknown God — the one who raised Jesus from the dead. Some sneer, some believe. Faithfulness matters more than results.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 66;

UPDATE public.quest_days SET passage_text = 'Paul stays in Corinth for a year and a half, making tents and planting a church. God tells him in a vision: "Do not be afraid. Keep on speaking. I have many people in this city." When God says stay, stay — even when it''s hard.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 67;

UPDATE public.quest_days SET passage_text = 'Paul returns to Ephesus where the Holy Spirit falls on new believers. Extraordinary miracles happen. People burn their sorcery scrolls worth a fortune. When the gospel takes hold, it changes everything — habits, priorities, and entire economies.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 68;

UPDATE public.quest_days SET passage_text = 'A silversmith named Demetrius starts a riot because Paul''s preaching is hurting his idol-making business. The whole city erupts in chaos. When the gospel threatens people''s income and comfort, expect pushback. The truth isn''t always popular, but it''s always worth it.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 69;

UPDATE public.quest_days SET passage_text = 'Paul travels through Greece and Asia, encouraging churches along the way. In Troas, he preaches so long a young man falls asleep and falls out a window — but Paul raises him back to life. Paul says goodbye to the Ephesian elders with tears. Leadership means pouring yourself out for others.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 70;

UPDATE public.quest_days SET passage_text = 'Paul arrives in Jerusalem and is welcomed by the church. But tension is building. He goes to the temple to show respect for Jewish customs, but a mob seizes him and tries to kill him. Doing the right thing doesn''t guarantee a smooth road.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 71;

UPDATE public.quest_days SET passage_text = 'Paul addresses the angry crowd from the steps, telling his conversion story — how Jesus changed him from a persecutor to a preacher. When he mentions God sending him to the Gentiles, the crowd erupts again. Your testimony is powerful, even when people don''t want to hear it.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 72;

UPDATE public.quest_days SET passage_text = 'Paul stands before the Jewish council and divides them by bringing up the resurrection. A plot to kill him is uncovered, and he''s transferred to Caesarea under heavy guard. God protects His servants — sometimes in unexpected ways.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 73;

UPDATE public.quest_days SET passage_text = 'Paul stands trial before Governor Felix and presents the gospel clearly. Felix is afraid and says, "When I find it convenient, I''ll send for you." He never does. Don''t put off responding to God — convenience is the enemy of commitment.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 74;

UPDATE public.quest_days SET passage_text = 'A new governor named Festus takes over and Paul''s enemies want him transferred to Jerusalem to ambush him. Paul exercises his right as a Roman citizen: "I appeal to Caesar!" God uses even legal systems to advance His plan.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 75;

UPDATE public.quest_days SET passage_text = 'Paul tells his story one more time before King Agrippa, holding nothing back about his encounter with Jesus. Agrippa says, "You almost persuade me to be a Christian." Almost isn''t enough. Don''t let "almost" be your answer to God.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 76;

UPDATE public.quest_days SET passage_text = 'Paul sets sail for Rome as a prisoner. A massive storm batters the ship for two weeks. Paul encourages everyone on board — an angel told him they''d all survive. Even in the worst storms of life, God is with you and He keeps His promises.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 77;

UPDATE public.quest_days SET passage_text = 'The ship wrecks on Malta. Paul is bitten by a viper but suffers no harm. He heals the sick on the island and the people show extraordinary kindness. God turns disasters into opportunities. Even a shipwreck becomes a mission field.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 78;

UPDATE public.quest_days SET passage_text = 'Paul finally arrives in Rome. Though he''s under house arrest, he preaches the kingdom of God to everyone who visits — boldly and without hindrance. Acts ends not with a period but with a comma. The story isn''t over. The gospel is still advancing — and you''re part of it now.'
WHERE quest_id = (SELECT id FROM public.quests WHERE title LIKE 'Luke%Acts%' LIMIT 1) AND day_number = 79;
