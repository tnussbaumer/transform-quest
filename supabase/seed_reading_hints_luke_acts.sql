-- ============================================================
-- Reading Hints for "Luke-Acts: The Gospel Unleashed" Quest
-- ============================================================
-- Run this in Supabase SQL Editor AFTER migration 013 has been applied.
-- These are short 1-2 sentence prompts to help high school students
-- engage with each daily passage. They're conversation starters,
-- not quiz questions.
--
-- IMPORTANT: This assumes the quest title is exactly
-- "Luke-Acts: The Gospel Unleashed" and day_numbers 1-79 exist.
-- If your quest has a different title, update the subquery below.
-- ============================================================

UPDATE quest_days SET reading_hint = CASE day_number

-- ── LUKE ──────────────────────────────────────────────────────

-- Day 1: Luke 1:1-4
WHEN 1 THEN 'Luke is writing to a specific person named Theophilus. Why do you think he felt it was so important to investigate everything carefully before writing it down?'

-- Day 2: Luke 1:5-25
WHEN 2 THEN 'Zechariah was a priest who served God his whole life — and still doubted when an angel spoke to him. What does that tell you about doubt?'

-- Day 3: Luke 1:26-56
WHEN 3 THEN 'Mary was probably a teenager when the angel appeared to her. How do you think you would have responded to news that would change your entire life?'

-- Day 4: Luke 1:57-80
WHEN 4 THEN 'Zechariah had been silent for nine months, and the first thing he does when he can speak again is praise God. What would be the first thing you would say?'

-- Day 5: Luke 2:1-20
WHEN 5 THEN 'The biggest announcement in history was made to shepherds — people nobody important paid attention to. Why do you think God chose them first?'

-- Day 6: Luke 2:21-52
WHEN 6 THEN 'At age 12, Jesus stayed behind at the temple and said he was in "his Father''s house." When did you first start understanding your own identity and purpose?'

-- Day 7: Luke 3:1-20
WHEN 7 THEN 'John the Baptist told everyone to prove their repentance through actions, not just words. What''s the difference between saying you''re sorry and actually changing?'

-- Day 8: Luke 3:21-38
WHEN 8 THEN 'Right after being baptized, God publicly says "You are my Son, whom I love." Imagine hearing that directly — how would it change the way you see yourself?'

-- Day 9: Luke 4:1-13
WHEN 9 THEN 'Every temptation the devil throws at Jesus is about taking a shortcut to something good. What shortcuts are you tempted to take in your own life?'

-- Day 10: Luke 4:14-30
WHEN 10 THEN 'Jesus reads Scripture in his hometown synagogue and basically says "This is about me." The people who watched him grow up are furious. Why is it so hard to accept that someone you know could be called to something huge?'

-- Day 11: Luke 4:31-44
WHEN 11 THEN 'Jesus heals people, casts out demons, and then sneaks away to be alone. Why do you think solitude mattered to him even when so many people needed him?'

-- Day 12: Luke 5:1-16
WHEN 12 THEN 'Peter had been fishing all night and caught nothing. Jesus tells him to try again. What''s it like to try something again when you already feel like you failed?'

-- Day 13: Luke 5:17-39
WHEN 13 THEN 'The friends literally cut a hole in a roof to get their paralyzed friend to Jesus. Who in your life would go to that kind of extreme for you — and who would you do that for?'

-- Day 14: Luke 6:1-16
WHEN 14 THEN 'Before choosing his 12 disciples, Jesus spent the entire night praying. What decisions in your life are big enough that they deserve that kind of time with God?'

-- Day 15: Luke 6:17-36
WHEN 15 THEN 'Jesus says "love your enemies" — not just tolerate them. Think of someone who is hard to be around. What would it actually look like to love them?'

-- Day 16: Luke 6:37-49
WHEN 16 THEN 'Jesus talks about building your life on rock vs. sand. What are you building your life on right now — things that will hold up, or things that won''t?'

-- Day 17: Luke 7:1-17
WHEN 17 THEN 'A Roman centurion — an outsider — shows more faith than anyone in Israel. Have you ever seen faith in someone you didn''t expect it from?'

-- Day 18: Luke 7:18-35
WHEN 18 THEN 'John the Baptist, sitting in prison, starts to wonder if Jesus is really the one. Even the strongest faith can have moments of doubt. What do you do with yours?'

-- Day 19: Luke 7:36-50
WHEN 19 THEN 'A woman with a bad reputation crashes a dinner party to wash Jesus'' feet with her tears. The religious leaders are disgusted, but Jesus welcomes her. Who does the world write off that Jesus wouldn''t?'

-- Day 20: Luke 8:1-21
WHEN 20 THEN 'In the parable of the soils, the same seed lands in four different places with completely different results. Which soil best describes where you are with God right now?'

-- Day 21: Luke 8:22-39
WHEN 21 THEN 'The disciples have seen Jesus do miracles, and they''re still terrified in the storm. What storm in your life makes it hard to trust that God is in control?'

-- Day 22: Luke 8:40-56
WHEN 22 THEN 'Jairus is desperate for his daughter, and a sick woman interrupts Jesus on the way. Sometimes God''s timing feels painfully slow. When has waiting been hardest for you?'

-- Day 23: Luke 9:1-17
WHEN 23 THEN 'The disciples say they only have five loaves and two fish — not nearly enough. But Jesus uses what they have. What do you have that feels "not enough" but could be offered to God?'

-- Day 24: Luke 9:18-36
WHEN 24 THEN 'Jesus says "whoever wants to save their life will lose it, but whoever loses their life for me will save it." What do you think he means by that in your everyday life — not just dramatic moments?'

-- Day 25: Luke 9:37-62
WHEN 25 THEN 'Three people tell Jesus they want to follow him, and he basically says "it''s going to cost you." What would following Jesus cost you right now — honestly?'

-- Day 26: Luke 10:1-24
WHEN 26 THEN 'Jesus sends out 72 ordinary people to do extraordinary things. He didn''t wait until they were "ready." What would it look like for you to step out before you feel qualified?'

-- Day 27: Luke 10:25-42
WHEN 27 THEN 'The Good Samaritan story is about a person everyone looked down on being the only one who actually helped. Who is the "Samaritan" in your world — someone you might overlook who shows real love?'

-- Day 28: Luke 11:1-28
WHEN 28 THEN 'The disciples see Jesus pray and ask him to teach them how. Prayer isn''t about fancy words — it''s a conversation. What would you say to God if you were completely honest right now?'

-- Day 29: Luke 11:29-54
WHEN 29 THEN 'Jesus is harsh with the religious leaders because they care more about looking righteous than actually being righteous. Where do you see that tension in your own life — caring about appearances vs. reality?'

-- Day 30: Luke 12:1-34
WHEN 30 THEN 'Jesus says "where your treasure is, there your heart will be also." What does the way you spend your time and money reveal about what you actually treasure?'

-- Day 31: Luke 12:35-59
WHEN 31 THEN 'Jesus tells a story about servants waiting for their master to return. The point is to live ready. If Jesus came back today, what would you want to be doing when he arrived?'

-- Day 32: Luke 13:1-21
WHEN 32 THEN 'Jesus compares the kingdom of God to a tiny mustard seed that grows into something enormous. What small thing in your faith right now could become something much bigger?'

-- Day 33: Luke 13:22-35
WHEN 33 THEN 'Someone asks "are only a few people going to be saved?" and Jesus doesn''t give a number — he just says "strive to enter." Why do you think he didn''t give a direct answer?'

-- Day 34: Luke 14:1-24
WHEN 34 THEN 'In the parable of the banquet, the people who were originally invited all made excuses. What excuses do you make for not showing up — for God, for people, for things that matter?'

-- Day 35: Luke 14:25-35
WHEN 35 THEN 'Jesus says to "count the cost" before following him — like a builder who plans before starting a tower. He''s not trying to scare people away; he''s being honest. Does that honesty make you more or less interested?'

-- Day 36: Luke 15:1-32
WHEN 36 THEN 'Three stories about things that are lost — a sheep, a coin, a son. In all three, there''s a party when the lost thing is found. What does that tell you about how God feels when someone comes back to him?'

-- Day 37: Luke 16:1-18
WHEN 37 THEN 'Jesus says "you cannot serve both God and money." He doesn''t say "you shouldn''t" — he says you literally can''t. Why do you think it''s impossible to fully commit to both?'

-- Day 38: Luke 16:19-31
WHEN 38 THEN 'The rich man ignored Lazarus every single day — he walked right past him. Who are the people you walk past every day without really seeing?'

-- Day 39: Luke 17:1-19
WHEN 39 THEN 'Ten people are healed, and only one comes back to say thank you. Jesus notices. When has God done something in your life that you forgot to be grateful for?'

-- Day 40: Luke 17:20-37
WHEN 40 THEN 'Jesus says the kingdom of God is "in your midst" — not far away, not future-only, but present right now. Where do you see God''s kingdom showing up in your everyday life?'

-- Day 41: Luke 18:1-17
WHEN 41 THEN 'Jesus says to receive the kingdom "like a little child." Kids don''t overthink trust — they just believe. What would it look like to have that kind of simple trust in God?'

-- Day 42: Luke 18:18-43
WHEN 42 THEN 'The rich ruler goes away sad because he''s not willing to let go of his wealth. What is the thing in your life that would be hardest to give up if God asked you to?'

-- Day 43: Luke 19:1-27
WHEN 43 THEN 'Zacchaeus was hated by everyone, and he climbed a tree just to see Jesus. When Jesus noticed him, everything changed. Have you ever felt like an outsider who just wanted to be seen?'

-- Day 44: Luke 19:28-48
WHEN 44 THEN 'Jesus enters Jerusalem to cheering crowds, but then he weeps over the city because they don''t understand what''s really happening. What does it say about Jesus that he cries even when people are celebrating him?'

-- Day 45: Luke 20:1-26
WHEN 45 THEN 'The religious leaders are trying to trap Jesus with trick questions, and he sees right through every one. Have you ever been in a situation where people weren''t really asking a question — they were trying to catch you?'

-- Day 46: Luke 20:27-47
WHEN 46 THEN 'Jesus says God "is not the God of the dead, but of the living." He sees Abraham, Isaac, and Jacob as still alive. What does it mean for how you think about death and eternity?'

-- Day 47: Luke 21:1-19
WHEN 47 THEN 'A widow puts two tiny coins in the offering — basically nothing — and Jesus says she gave more than everyone else. How does God measure generosity differently than we do?'

-- Day 48: Luke 21:20-38
WHEN 48 THEN 'Jesus describes really scary future events, then says "stand up and lift your heads, because your redemption is drawing near." Why would he say to look UP when everything seems to be falling apart?'

-- Day 49: Luke 22:1-23
WHEN 49 THEN 'At the Last Supper, Jesus knows Judas is about to betray him — and he still serves him the bread. What does it mean to love someone even when you know they''re going to hurt you?'

-- Day 50: Luke 22:24-46
WHEN 50 THEN 'Right after the most important meal in history, the disciples start arguing about which of them is the greatest. Why do you think status and recognition matter so much to us — even in spiritual moments?'

-- Day 51: Luke 22:47-71
WHEN 51 THEN 'Peter follows Jesus to the trial, and then denies knowing him three times. He didn''t plan to — it just happened under pressure. When has fear made you act in a way you didn''t expect?'

-- Day 52: Luke 23:1-25
WHEN 52 THEN 'Pilate says three times that Jesus is innocent, then hands him over to be crucified anyway because of crowd pressure. How powerful is it when everyone around you is saying the same thing — even if it''s wrong?'

-- Day 53: Luke 23:26-56
WHEN 53 THEN 'On the cross, Jesus says "Father, forgive them, for they do not know what they are doing." He''s forgiving people in the middle of being killed by them. Is there anyone you need to forgive even though they haven''t asked for it?'

-- Day 54: Luke 24:1-35
WHEN 54 THEN 'Two disciples are walking to Emmaus, completely hopeless, and Jesus walks right next to them — but they don''t recognize him. Have you ever looked back and realized God was with you in a hard moment and you didn''t see it at the time?'

-- Day 55: Luke 24:36-53
WHEN 55 THEN 'The risen Jesus shows up and the disciples are "startled and frightened." Even good surprises from God can be scary. What would it look like for Jesus to show up in a way you''re not expecting?'

-- ── ACTS ──────────────────────────────────────────────────────

-- Day 56: Acts 1:1-26
WHEN 56 THEN 'Jesus tells the disciples to wait in Jerusalem before going out to change the world. Why do you think waiting was necessary before the mission could start?'

-- Day 57: Acts 2:1-21
WHEN 57 THEN 'The Holy Spirit shows up with wind and fire and suddenly everyone is speaking different languages. The disciples went from hiding in fear to boldly preaching in public. What changed?'

-- Day 58: Acts 2:22-47
WHEN 58 THEN 'After Peter''s first sermon, 3,000 people become believers. Then they immediately start sharing meals, selling possessions to help each other, and meeting daily. What made that community so magnetic?'

-- Day 59: Acts 3:1-26
WHEN 59 THEN 'Peter tells a man begging for money, "Silver or gold I do not have, but what I do have I give you." He offered something better than what the man asked for. Has God ever answered your prayer with something different — and better — than what you wanted?'

-- Day 60: Acts 4:1-22
WHEN 60 THEN 'The religious leaders are "astonished" that Peter and John are so bold because they were "unschooled, ordinary men." God doesn''t need your résumé. What would you do if you stopped waiting to feel qualified?'

-- Day 61: Acts 4:23-5:11
WHEN 61 THEN 'Ananias and Sapphira pretend to give everything when they actually kept some back. The issue wasn''t keeping money — it was lying about it. Why is pretending to be more generous or spiritual than you are so dangerous?'

-- Day 62: Acts 5:12-42
WHEN 62 THEN 'The apostles are thrown in jail, beaten, and ordered to stop talking about Jesus. They leave "rejoicing because they had been counted worthy of suffering." What would make suffering feel like an honor instead of a punishment?'

-- Day 63: Acts 6:1-7:29
WHEN 63 THEN 'Stephen is chosen to serve tables — a practical, unglamorous job — and ends up becoming one of the boldest voices in the early church. How has doing something small ever led to something bigger in your life?'

-- Day 64: Acts 7:30-60
WHEN 64 THEN 'Stephen gives a long speech knowing it will probably get him killed, and he does it anyway. What would you be willing to say even if it cost you everything?'

-- Day 65: Acts 8:1-25
WHEN 65 THEN 'Persecution scatters the believers out of Jerusalem, and that''s actually what spreads the gospel to new places. When has something painful in your life led to something unexpectedly good?'

-- Day 66: Acts 8:26-40
WHEN 66 THEN 'Philip is told by an angel to go to a random desert road, and there he meets the exact right person at the exact right time. Have you ever had a "coincidence" that felt way too perfect to be random?'

-- Day 67: Acts 9:1-31
WHEN 67 THEN 'Saul goes from hunting Christians to becoming one in a single encounter with Jesus. His entire identity flips. Do you believe people can truly change that dramatically — even people who seem hopeless?'

-- Day 68: Acts 9:32-10:23
WHEN 68 THEN 'God gives Peter a vision that challenges everything he believed about who is "clean" and who is "unclean." What assumptions about people has God challenged in your life?'

-- Day 69: Acts 10:24-48
WHEN 69 THEN 'Peter realizes "God does not show favoritism." The gospel isn''t just for people who look, talk, and act like you. Who in your life is different from you that God might be inviting you to see differently?'

-- Day 70: Acts 11:1-30
WHEN 70 THEN 'When the Jewish believers hear that Gentiles received the Holy Spirit too, they say "So then, even to Gentiles God has granted repentance that leads to life." They''re surprised — but they accept it. When has God done something that expanded your understanding of who he loves?'

-- Day 71: Acts 12:1-25
WHEN 71 THEN 'The church is praying for Peter''s release from prison. An angel frees him, and when he shows up at the door, they don''t believe it''s actually him. Have you ever prayed for something and then been shocked when God actually did it?'

-- Day 72: Acts 13:1-52
WHEN 72 THEN 'The church in Antioch is worshiping and fasting when the Holy Spirit says "set apart Barnabas and Saul for the work I have called them to." God''s next step for them came during worship, not planning meetings. When has God spoken to you in an unexpected moment?'

-- Day 73: Acts 14:1-28
WHEN 73 THEN 'Paul and Barnabas are worshiped as gods in one city and then stoned in the very next one. Following Jesus means your circumstances can flip fast. What keeps you grounded when life swings between highs and lows?'

-- Day 74: Acts 15:1-35
WHEN 74 THEN 'The early church has its first major disagreement — do non-Jewish believers need to follow all Jewish laws? They talk it out, listen to each other, and find a way forward together. How do you handle disagreements about faith with people you respect?'

-- Day 75: Acts 15:36-16:15
WHEN 75 THEN 'Paul and Barnabas split up because they can''t agree on whether to bring John Mark along. Even great ministry partners have real conflicts. How do you handle it when you and someone you care about just can''t see eye to eye?'

-- Day 76: Acts 16:16-40
WHEN 76 THEN 'Paul and Silas are beaten and thrown in prison, and at midnight they''re singing hymns. They didn''t wait for the situation to improve to worship. What would it take for you to worship in your worst moment?'

-- Day 77: Acts 17:1-34
WHEN 77 THEN 'In Athens, Paul looks at all the idols and altars and uses them as a starting point to talk about Jesus. He meets people where they are instead of condemning them. How can you talk about your faith in a way that connects with people who believe differently?'

-- Day 78: Acts 18:1-28
WHEN 78 THEN 'God tells Paul "Do not be afraid; keep on speaking... for I have many people in this city." Sometimes God''s encouragement isn''t "it will be easy" — it''s "I''m with you, keep going." When have you needed to hear that?'

-- Day 79: Acts 19:1-20
WHEN 79 THEN 'Some people try to use Jesus'' name like a magic spell without actually knowing him, and it backfires badly. Faith isn''t a formula or a tool — it''s a relationship. What''s the difference between knowing about Jesus and actually knowing him?'

ELSE reading_hint END  -- leave any days beyond 79 unchanged

WHERE quest_id = (
  SELECT id FROM quests WHERE title ILIKE '%luke%acts%gospel%unleashed%' LIMIT 1
)
AND day_number BETWEEN 1 AND 79;
