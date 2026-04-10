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
--
-- NOTE: These hints are aligned to the passage_reference values
-- in seed_luke_acts.sql. If passages change, update hints to match.
-- ============================================================

UPDATE quest_days SET reading_hint = CASE day_number

-- ── LUKE ──────────────────────────────────────────────────────

-- Day 1: Luke 1:1-4
WHEN 1 THEN 'Luke is writing to a specific person named Theophilus. Why do you think he felt it was so important to investigate everything carefully before writing it down?'

-- Day 2: Luke 1:5-25
WHEN 2 THEN 'Zechariah was a priest who served God his whole life — and still doubted when an angel spoke to him. What does that tell you about doubt?'

-- Day 3: Luke 1:26-38
WHEN 3 THEN 'Mary was probably a teenager when the angel appeared to her. How do you think you would have responded to news that would change your entire life?'

-- Day 4: Luke 1:39-56
WHEN 4 THEN 'Mary visits her cousin Elizabeth, and the moment they meet, both of them burst into praise. Mary''s song — the Magnificat — is about God lifting up the lowly and bringing down the powerful. What does it look like when God uses unexpected people?'

-- Day 5: Luke 1:57-80
WHEN 5 THEN 'Zechariah had been silent for nine months, and the first thing he does when he can speak again is praise God. What would be the first thing you would say?'

-- Day 6: Luke 2:1-20
WHEN 6 THEN 'The biggest announcement in history was made to shepherds — people nobody important paid attention to. Why do you think God chose them first?'

-- Day 7: Luke 2:21-40
WHEN 7 THEN 'Simeon and Anna had been waiting their entire lives for this moment. Simeon holds baby Jesus and says he can now die in peace. What are you waiting and hoping for from God?'

-- Day 8: Luke 2:41-52
WHEN 8 THEN 'At age 12, Jesus stayed behind at the temple and said he was in "his Father''s house." When did you first start understanding your own identity and purpose?'

-- Day 9: Luke 3:1-20
WHEN 9 THEN 'John the Baptist told everyone to prove their repentance through actions, not just words. What''s the difference between saying you''re sorry and actually changing?'

-- Day 10: Luke 3:21-38
WHEN 10 THEN 'Right after being baptized, God publicly says "You are my Son, whom I love." Imagine hearing that directly — how would it change the way you see yourself?'

-- Day 11: Luke 4:1-15
WHEN 11 THEN 'Every temptation the devil throws at Jesus is about taking a shortcut to something good. What shortcuts are you tempted to take in your own life?'

-- Day 12: Luke 4:16-44
WHEN 12 THEN 'Jesus reads Scripture in his hometown synagogue and basically says "This is about me." The people who watched him grow up are furious. Why is it so hard to accept that someone you know could be called to something huge?'

-- Day 13: Luke 5:1-26
WHEN 13 THEN 'Peter had been fishing all night and caught nothing. Jesus tells him to try again. What''s it like to try something again when you already feel like you failed?'

-- Day 14: Luke 5:27-6:11
WHEN 14 THEN 'Jesus picks a tax collector — someone everyone despised — to be one of his followers. Then he starts breaking the religious rules everyone expected him to follow. Why do you think Jesus kept choosing people and situations that made the religious crowd uncomfortable?'

-- Day 15: Luke 6:12-49
WHEN 15 THEN 'Jesus says "love your enemies" — not just tolerate them. Think of someone who is hard to be around. What would it actually look like to love them?'

-- Day 16: Luke 7:1-35
WHEN 16 THEN 'A Roman centurion — an outsider — shows more faith than anyone in Israel. Have you ever seen faith in someone you didn''t expect it from?'

-- Day 17: Luke 7:36-8:21
WHEN 17 THEN 'A woman with a bad reputation crashes a dinner party to wash Jesus'' feet with her tears. The religious leaders are disgusted, but Jesus welcomes her. Who does the world write off that Jesus wouldn''t?'

-- Day 18: Luke 8:22-56
WHEN 18 THEN 'The disciples have seen Jesus do miracles, and they''re still terrified in the storm. What storm in your life makes it hard to trust that God is in control?'

-- Day 19: Luke 9:1-36
WHEN 19 THEN 'The disciples say they only have five loaves and two fish — not nearly enough. But Jesus uses what they have. What do you have that feels "not enough" but could be offered to God?'

-- Day 20: Luke 9:37-50
WHEN 20 THEN 'The disciples argue about which of them is the greatest — right after failing to help a desperate dad heal his son. Jesus responds by putting a child in front of them. What is Jesus trying to teach them about real greatness?'

-- Day 21: Luke 9:51-10:24
WHEN 21 THEN 'Jesus sends out 72 ordinary people to do extraordinary things. He didn''t wait until they were "ready." What would it look like for you to step out before you feel qualified?'

-- Day 22: Luke 10:25-42
WHEN 22 THEN 'The Good Samaritan story is about a person everyone looked down on being the only one who actually helped. Who is the "Samaritan" in your world — someone you might overlook who shows real love?'

-- Day 23: Luke 11:1-36
WHEN 23 THEN 'The disciples see Jesus pray and ask him to teach them how. Prayer isn''t about fancy words — it''s a conversation. What would you say to God if you were completely honest right now?'

-- Day 24: Luke 11:37-12:12
WHEN 24 THEN 'Jesus is harsh with the religious leaders because they care more about looking righteous than actually being righteous. Where do you see that tension in your own life — caring about appearances vs. reality?'

-- Day 25: Luke 12:13-48
WHEN 25 THEN 'Jesus says "where your treasure is, there your heart will be also." What does the way you spend your time and money reveal about what you actually treasure?'

-- Day 26: Luke 12:49-13:21
WHEN 26 THEN 'Jesus compares the kingdom of God to a tiny mustard seed that grows into something enormous. What small thing in your faith right now could become something much bigger?'

-- Day 27: Luke 13:22-14:14
WHEN 27 THEN 'Someone asks "are only a few people going to be saved?" and Jesus doesn''t give a number — he just says "strive to enter." Why do you think he didn''t give a direct answer?'

-- Day 28: Luke 14:15-35
WHEN 28 THEN 'In the parable of the banquet, the people who were originally invited all made excuses. What excuses do you make for not showing up — for God, for people, for things that matter?'

-- Day 29: Luke 15:1-32
WHEN 29 THEN 'Three stories about things that are lost — a sheep, a coin, a son. In all three, there''s a party when the lost thing is found. What does that tell you about how God feels when someone comes back to him?'

-- Day 30: Luke 16:1-18
WHEN 30 THEN 'Jesus says "you cannot serve both God and money." He doesn''t say "you shouldn''t" — he says you literally can''t. Why do you think it''s impossible to fully commit to both?'

-- Day 31: Luke 16:19-17:19
WHEN 31 THEN 'The rich man ignored Lazarus every single day — he walked right past him. Who are the people you walk past every day without really seeing?'

-- Day 32: Luke 17:20-18:17
WHEN 32 THEN 'Jesus says to receive the kingdom "like a little child." Kids don''t overthink trust — they just believe. What would it look like to have that kind of simple trust in God?'

-- Day 33: Luke 18:18-19:10
WHEN 33 THEN 'Zacchaeus was hated by everyone, and he climbed a tree just to see Jesus. When Jesus noticed him, everything changed. Have you ever felt like an outsider who just wanted to be seen?'

-- Day 34: Luke 19:11-27
WHEN 34 THEN 'In this parable, every servant is given the same amount. The difference isn''t what they receive — it''s what they do with it. What has God given you that you''re not using yet?'

-- Day 35: Luke 19:28-48
WHEN 35 THEN 'Jesus enters Jerusalem to cheering crowds, but then he weeps over the city because they don''t understand what''s really happening. What does it say about Jesus that he cries even when people are celebrating him?'

-- Day 36: Luke 20:1-26
WHEN 36 THEN 'The religious leaders are trying to trap Jesus with trick questions, and he sees right through every one. Have you ever been in a situation where people weren''t really asking a question — they were trying to catch you?'

-- Day 37: Luke 20:27-21:4
WHEN 37 THEN 'A widow puts two tiny coins in the offering — basically nothing — and Jesus says she gave more than everyone else. How does God measure generosity differently than we do?'

-- Day 38: Luke 21:5-38
WHEN 38 THEN 'Jesus describes really scary future events, then says "stand up and lift your heads, because your redemption is drawing near." Why would he say to look UP when everything seems to be falling apart?'

-- Day 39: Luke 22:1-38
WHEN 39 THEN 'At the Last Supper, Jesus knows Judas is about to betray him — and he still serves him the bread. What does it mean to love someone even when you know they''re going to hurt you?'

-- Day 40: Luke 22:39-71
WHEN 40 THEN 'Peter follows Jesus to the trial, and then denies knowing him three times. He didn''t plan to — it just happened under pressure. When has fear made you act in a way you didn''t expect?'

-- Day 41: Luke 23:1-25
WHEN 41 THEN 'Pilate says three times that Jesus is innocent, then hands him over to be crucified anyway because of crowd pressure. How powerful is it when everyone around you is saying the same thing — even if it''s wrong?'

-- Day 42: Luke 23:26-56
WHEN 42 THEN 'On the cross, Jesus says "Father, forgive them, for they do not know what they are doing." He''s forgiving people in the middle of being killed by them. Is there anyone you need to forgive even though they haven''t asked for it?'

-- Day 43: Luke 24:1-35
WHEN 43 THEN 'Two disciples are walking to Emmaus, completely hopeless, and Jesus walks right next to them — but they don''t recognize him. Have you ever looked back and realized God was with you in a hard moment and you didn''t see it at the time?'

-- Day 44: Luke 24:36-53
WHEN 44 THEN 'The risen Jesus shows up and the disciples are "startled and frightened." Even good surprises from God can be scary. What would it look like for Jesus to show up in a way you''re not expecting?'

-- ── ACTS ──────────────────────────────────────────────────────

-- Day 45: Acts 1:1-26
WHEN 45 THEN 'Jesus tells the disciples to wait in Jerusalem before going out to change the world. Why do you think waiting was necessary before the mission could start?'

-- Day 46: Acts 2:1-13
WHEN 46 THEN 'The Holy Spirit shows up with wind and fire and suddenly everyone is speaking different languages. The disciples went from hiding in fear to boldly preaching in public. What changed?'

-- Day 47: Acts 2:14-47
WHEN 47 THEN 'After Peter''s first sermon, 3,000 people become believers. Then they immediately start sharing meals, selling possessions to help each other, and meeting daily. What made that community so magnetic?'

-- Day 48: Acts 3:1-26
WHEN 48 THEN 'Peter tells a man begging for money, "Silver or gold I do not have, but what I do have I give you." He offered something better than what the man asked for. Has God ever answered your prayer with something different — and better — than what you wanted?'

-- Day 49: Acts 4:1-31
WHEN 49 THEN 'The religious leaders are "astonished" that Peter and John are so bold because they were "unschooled, ordinary men." God doesn''t need your résumé. What would you do if you stopped waiting to feel qualified?'

-- Day 50: Acts 4:32-5:11
WHEN 50 THEN 'Ananias and Sapphira pretend to give everything when they actually kept some back. The issue wasn''t keeping money — it was lying about it. Why is pretending to be more generous or spiritual than you are so dangerous?'

-- Day 51: Acts 5:12-42
WHEN 51 THEN 'The apostles are thrown in jail, beaten, and ordered to stop talking about Jesus. They leave "rejoicing because they had been counted worthy of suffering." What would make suffering feel like an honor instead of a punishment?'

-- Day 52: Acts 6:1-15
WHEN 52 THEN 'Stephen is chosen to serve tables — a practical, unglamorous job — and ends up becoming one of the boldest voices in the early church. How has doing something small ever led to something bigger in your life?'

-- Day 53: Acts 7:1-60
WHEN 53 THEN 'Stephen gives a long speech knowing it will probably get him killed, and he does it anyway. What would you be willing to say even if it cost you everything?'

-- Day 54: Acts 8:1-25
WHEN 54 THEN 'Persecution scatters the believers out of Jerusalem, and that''s actually what spreads the gospel to new places. When has something painful in your life led to something unexpectedly good?'

-- Day 55: Acts 8:26-40
WHEN 55 THEN 'Philip is told by an angel to go to a random desert road, and there he meets the exact right person at the exact right time. Have you ever had a "coincidence" that felt way too perfect to be random?'

-- Day 56: Acts 9:1-31
WHEN 56 THEN 'Saul goes from hunting Christians to becoming one in a single encounter with Jesus. His entire identity flips. Do you believe people can truly change that dramatically — even people who seem hopeless?'

-- Day 57: Acts 9:32-43
WHEN 57 THEN 'Peter heals a paralyzed man and raises a woman named Tabitha from the dead. These miracles happen in small towns, not big stages. Why do you think God so often works in places most people would overlook?'

-- Day 58: Acts 10:1-48
WHEN 58 THEN 'Peter realizes "God does not show favoritism." The gospel isn''t just for people who look, talk, and act like you. Who in your life is different from you that God might be inviting you to see differently?'

-- Day 59: Acts 11:1-30
WHEN 59 THEN 'When the Jewish believers hear that Gentiles received the Holy Spirit too, they say "So then, even to Gentiles God has granted repentance that leads to life." They''re surprised — but they accept it. When has God done something that expanded your understanding of who he loves?'

-- Day 60: Acts 12:1-25
WHEN 60 THEN 'The church is praying for Peter''s release from prison. An angel frees him, and when he shows up at the door, they don''t believe it''s actually him. Have you ever prayed for something and then been shocked when God actually did it?'

-- Day 61: Acts 13:1-25
WHEN 61 THEN 'The church in Antioch is worshiping and fasting when the Holy Spirit says "set apart Barnabas and Saul for the work I have called them to." God''s next step for them came during worship, not planning meetings. When has God spoken to you in an unexpected moment?'

-- Day 62: Acts 13:26-52
WHEN 62 THEN 'Paul preaches in a synagogue and some believe while others get jealous and hostile. When the Jewish leaders reject the message, Paul turns to the Gentiles. Have you ever seen something meant for one group end up reaching a completely different one?'

-- Day 63: Acts 14:1-28
WHEN 63 THEN 'Paul and Barnabas are worshiped as gods in one city and then stoned in the very next one. Following Jesus means your circumstances can flip fast. What keeps you grounded when life swings between highs and lows?'

-- Day 64: Acts 15:1-35
WHEN 64 THEN 'The early church has its first major disagreement — do non-Jewish believers need to follow all Jewish laws? They talk it out, listen to each other, and find a way forward together. How do you handle disagreements about faith with people you respect?'

-- Day 65: Acts 15:36-16:40
WHEN 65 THEN 'Paul and Barnabas split up because they can''t agree on whether to bring John Mark along. Even great ministry partners have real conflicts. How do you handle it when you and someone you care about just can''t see eye to eye?'

-- Day 66: Acts 17:1-34
WHEN 66 THEN 'In Athens, Paul looks at all the idols and altars and uses them as a starting point to talk about Jesus. He meets people where they are instead of condemning them. How can you talk about your faith in a way that connects with people who believe differently?'

-- Day 67: Acts 18:1-22
WHEN 67 THEN 'God tells Paul "Do not be afraid; keep on speaking... for I have many people in this city." Sometimes God''s encouragement isn''t "it will be easy" — it''s "I''m with you, keep going." When have you needed to hear that?'

-- Day 68: Acts 18:23-19:20
WHEN 68 THEN 'Some people try to use Jesus'' name like a magic spell without actually knowing him, and it backfires badly. Faith isn''t a formula or a tool — it''s a relationship. What''s the difference between knowing about Jesus and actually knowing him?'

-- Day 69: Acts 19:21-41
WHEN 69 THEN 'The gospel is so effective in Ephesus that the idol-making business starts losing money, and a full-scale riot breaks out. When has doing the right thing created conflict because it threatened someone else''s comfort or profit?'

-- Day 70: Acts 20:1-21:16
WHEN 70 THEN 'Paul says goodbye to leaders he loves, knowing he''ll probably never see them again. He says "I consider my life worth nothing to me; my only aim is to finish the race." What would finishing your race for God look like?'

-- Day 71: Acts 21:17-36
WHEN 71 THEN 'Paul goes to Jerusalem even though everyone warned him he''d be arrested. He walks straight into danger because he believes it''s where God wants him. When has following God taken you somewhere you didn''t want to go?'

-- Day 72: Acts 21:37-22:29
WHEN 72 THEN 'Paul shares his own story — how he went from persecuting Christians to becoming one. Your personal story of how God has changed you is one of the most powerful things you have. What''s yours?'

-- Day 73: Acts 22:30-23:35
WHEN 73 THEN 'A group of men vow not to eat until they''ve killed Paul. God uses Paul''s nephew — probably a teenager — to uncover the plot and save his life. How has God ever used someone unexpected to protect or help you?'

-- Day 74: Acts 24:1-27
WHEN 74 THEN 'Felix listens to Paul talk about faith, self-control, and the coming judgment, and gets afraid. But instead of responding, he says "I''ll call for you later." What important conversations or decisions are you putting off?'

-- Day 75: Acts 25:1-12
WHEN 75 THEN 'Paul has been stuck in prison for two years and could have been released, but he appeals to Caesar instead — taking his case to the highest court in the world. Sometimes God''s plan takes you to places you''d never choose. When has a detour in your life turned out to be the actual path?'

-- Day 76: Acts 25:13-26:32
WHEN 76 THEN 'Paul tells his story again, this time to a king. Agrippa says "Do you think you can persuade me to become a Christian so quickly?" Paul answers "I wish everyone could be like me — except for these chains." What does that level of conviction look like?'

-- Day 77: Acts 27:1-44
WHEN 77 THEN 'Paul is a prisoner on a ship that''s falling apart in a massive storm. But he''s the calmest person on board because God told him everyone would survive. What gives you peace when everything around you feels out of control?'

-- Day 78: Acts 28:1-16
WHEN 78 THEN 'Paul is bitten by a snake and the locals think he''s cursed. When nothing happens, they change their minds and think he''s a god. People are quick to judge and quick to flip. How do you handle being misjudged?'

-- Day 79: Acts 28:17-31
WHEN 79 THEN 'Acts ends with Paul under house arrest in Rome, "boldly and without hindrance" preaching the gospel. The book doesn''t have a tidy conclusion — because the story isn''t over. You''re part of it now. What''s your next chapter?'

ELSE reading_hint END  -- leave any days beyond 79 unchanged

WHERE quest_id = (
  SELECT id FROM quests WHERE title ILIKE '%luke%acts%gospel%unleashed%' LIMIT 1
)
AND day_number BETWEEN 1 AND 79;
