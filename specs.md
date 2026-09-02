# 365 — My Year

## Product & Technical Specification v2

### Working concept

**365 — My Year** is a personal recovery and life-rebuilding application.

The user is starting a one-year alcohol-free challenge on **30 August 2026**, but the purpose of the application is much broader:

> **Help me understand what makes me feel better, healthier, more energetic and more alive.**

The application combines:

* alcohol-free tracking;
* physical wellbeing;
* sleep;
* mood and energy;
* exercise;
* nutrition;
* symptoms;
* creativity;
* hobbies and interests;
* meaningful activities;
* personal goals;
* reflection and journaling.

The product should feel like a **personal life experiment**, not a medical tracker or sobriety punishment app.

---

# 1. Product philosophy

The central idea is:

## "I'm not just giving something up. I'm building something new."

The application should help the user replace unhealthy or empty habits with activities that create genuine interest, energy and satisfaction.

Alcohol is one measurable variable.

The real objective is:

**Build a life I don't need to escape from.**

The app must therefore track both:

### What I reduce

* Alcohol
* Poor sleep
* Excessive stress
* Sedentary time
* Other personally defined habits

### What I increase

* Sleep
* Movement
* Creativity
* Hobbies
* Social connection
* Time outdoors
* Learning
* Meaningful activities
* Things that make me happy

---

# 2. Challenge

Start:

**30 August 2026**

End:

**29 August 2027**

Duration:

**365 days**

Current day is calculated automatically.

Example:

30 Aug → Day 1
31 Aug → Day 2
1 Sep → Day 3
2 Sep → Day 4

Dashboard:

**DAY 4 / 365**

**364 DAYS LEFT**

**1.1% COMPLETE**

---

# 3. Main navigation

Mobile-first bottom navigation:

1. 🏠 Today
2. 📊 Trends
3. ✨ Life
4. 📅 Timeline
5. ⚙️ Settings

---

# 4. TODAY

The Today screen should answer:

> "How am I doing today?"

## Header

**365 — MY YEAR**

`DAY 4 / 365`

Progress indicator.

---

## Today's wellbeing

Quick cards:

* Sleep
* Energy
* Mood
* Stress
* General wellbeing

Example:

Sleep `8/10`
Energy `7/10`
Mood `8/10`

---

## Symptoms

Track:

* Stomach
* Abdominal pain
* Bloating
* Nausea
* Dizziness
* Headache
* Fatigue
* Cough
* Breathing discomfort

All use:

`0–10`

0 = none
10 = severe

Allow custom symptoms.

---

## Alcohol

Simple:

**Alcohol today?**

`NO ✅`

If Yes:

* approximate amount
* trigger
* optional note

Never use shame or punishment.

Historical alcohol-free days remain preserved even if the user drinks.

---

# 5. DAILY CHECK-IN

The daily check-in must take **less than 2 minutes**.

Sections:

### Body

* Sleep
* Energy
* Symptoms

### Mind

* Mood
* Stress
* Motivation

### Lifestyle

* Alcohol
* Exercise
* Water
* Caffeine

### Life

* Did I do something enjoyable today?
* Did I do something creative today?
* Did I spend meaningful time with someone?
* Did I spend time outside?

### Reflection

Optional:

**"How was today?"**

Free-text note.

---

# 6. NEW CORE FEATURE — LIFE / JOY

This is a major part of the application.

The application should track **activities that make the user feel alive, interested or fulfilled**.

The user can create categories.

Default categories:

### 🎨 Creativity

* Sewing
* Clothing design
* Drawing
* Painting
* Photography
* Writing
* Crafts
* Music

### 🧠 Learning

* Languages
* Courses
* Books
* New skills
* Technology
* Other

### 🌿 Nature

* Walking
* Hiking
* Gardening
* Beach
* Cycling
* Other

### ❤️ Connection

* Family
* Friends
* Date
* Conversation
* Community

### 🧘 Wellbeing

* Meditation
* Yoga
* Relaxation
* Self-care

### 🎉 Fun

Anything the user simply enjoys.

The user can create completely custom categories.

---

# 7. ACTIVITY LOG

Every meaningful activity can be logged.

Example:

## Sewing

Duration:

`45 minutes`

Before:

Energy `4/10`

After:

Energy `7/10`

Enjoyment:

`5/5 ❤️`

Optional:

> "I really missed this."

The important metric is not productivity.

The important question is:

> **"Did this make me feel better?"**

---

# 8. CREATIVE JOURNEY

The user specifically wants to return to:

**Sewing and clothing design**, which she enjoyed as a child.

Create a dedicated project type:

## Creative Project

Example:

### "Return to Sewing"

Status:

`In progress`

Milestones:

* [ ] Find sewing machine
* [ ] Set up workspace
* [ ] Review basic techniques
* [ ] Choose first project
* [ ] Choose fabric
* [ ] Start project
* [ ] Finish first item
* [ ] Photograph finished item
* [ ] Start next project

The system must support arbitrary projects.

Examples:

* Make a dress
* Design a skirt
* Learn pattern making
* Create a mini collection
* Learn fashion illustration

---

# 9. PROJECTS

Allow the user to create long-term personal projects.

Project fields:

* Name
* Category
* Description
* Start date
* Target date
* Status
* Milestones
* Notes
* Photos
* Time invested

Categories:

* Creative
* Learning
* Health
* Travel
* Home
* Career
* Relationships
* Personal
* Other

Do not force deadlines.

Projects can simply be:

**"Something I want to explore."**

---

# 10. "THINGS I WANT TO TRY"

Create an idea bank.

Example:

### Things I want to try

* Sewing again
* Fashion design
* Pottery
* Photography
* Dancing
* Painting
* New language
* Hiking
* Cooking something new

Each item can be:

* Idea
* Interested
* Tried
* Loved ❤️
* Not for me

This is intentionally different from a productivity task list.

The purpose is **exploration**.

---

# 11. PERSONAL INTEREST DISCOVERY

After enough data, the application should surface patterns.

Example:

> **You seem to enjoy creative activities.**

> In the last 30 days you spent 4.5 hours on creative activities.

> Your average mood after creative activities was **8.1/10**, compared with **6.4/10** on days without them.

Another example:

> **Sewing appears to be particularly meaningful for you.**

> You rated 4 of 5 sewing sessions 5/5 for enjoyment.

The application should use cautious language:

* "Your data suggests..."
* "You seem to..."
* "There appears to be an association..."

Never make psychological or medical diagnoses.

---

# 12. RECOVERY vs JOY

Create two complementary dimensions.

## Recovery

Things that help the body:

* Alcohol-free
* Sleep
* Nutrition
* Hydration
* Exercise
* Rest

## Life

Things that make life richer:

* Creativity
* Hobbies
* Friends
* Family
* Learning
* Nature
* Travel
* Fun
* Personal projects

The dashboard should show both.

Example:

### BODY

Alcohol-free: ✅
Sleep: 7h 48m
Exercise: 42 min
Symptoms: ↓

### LIFE

Creative time: 45 min
Fun: ⭐⭐⭐⭐⭐
Connection: ❤️
Learning: 20 min

---

# 13. WEEKLY REVIEW

Every week generate a summary.

Example:

# WEEK 1

### Body

Alcohol-free:

**7 / 7 days**

Average sleep:

**7h 32m**

Energy:

**6.4 / 10**

---

### Symptoms

Stomach:

**3.1 / 10**

Dizziness:

**2.0 / 10**

Cough:

**4.3 / 10**

---

### Life

Creative time:

**1h 35m**

Exercise:

**3 sessions**

Time outdoors:

**4 days**

Meaningful connection:

**3 days**

---

### What made you feel good?

Show the activities with the highest post-activity ratings.

Example:

1. Sewing ⭐⭐⭐⭐⭐
2. Walk ⭐⭐⭐⭐
3. Dinner with friends ⭐⭐⭐⭐

---

### Reflection

Ask:

**What do you want more of next week?**

---

# 14. MONTHLY REVIEW

Monthly review should feel like a personal magazine/report rather than a spreadsheet.

Example:

# SEPTEMBER

## You showed up for yourself 27 days.

### Body

Alcohol-free:

`30 / 30`

Average sleep:

`7h 41m`

Energy:

`+18%`

Dizziness:

`-42%`

---

### Life

Creative hours:

`6h 20m`

New things tried:

`3`

Favourite activity:

`Sewing`

---

### This month you discovered:

> "Creative activities consistently improved your mood."

---

### Memory of the month

Allow the user to select:

* favourite photo
* favourite note
* favourite day
* favourite activity

This creates a personal visual history of the year.

---

# 15. YEAR TIMELINE

Create a chronological timeline.

Example:

### AUGUST 30

🌱 Started 365-day experiment.

### SEPTEMBER 2

🧵 Decided to return to sewing.

### SEPTEMBER 10

🎨 First creative session.

### SEPTEMBER 25

👗 Finished first piece.

The timeline becomes a **story of the year**.

---

# 16. YEAR-END EXPERIENCE

On Day 365 generate a final report:

# MY YEAR

**30 Aug 2026 → 29 Aug 2027**

Show:

### Body

* Alcohol-free days
* Sleep improvement
* Energy trend
* Symptom trends
* Exercise
* Weight trend if tracked

### Life

* Creative hours
* Number of hobbies tried
* Projects completed
* Books read
* Time outdoors
* Meaningful activities
* Favourite activities

### Personal highlights

Show selected photos and journal entries.

### Biggest discoveries

Based on user data:

> "You felt best after..."

> "Your most consistent positive activity was..."

> "Your sleep was strongest when..."

The report should feel celebratory, not clinical.

---

# 17. TRENDS

Charts:

### Physical

* Symptoms
* Sleep
* Energy
* Weight
* Exercise

### Mental

* Mood
* Stress
* Motivation

### Lifestyle

* Alcohol
* Water
* Caffeine
* Exercise

### Life

* Creative time
* Hobby time
* Social time
* Outdoor time
* Learning time
* Enjoyment score

Time ranges:

* 7 days
* 30 days
* 90 days
* 365 days

---

# 18. CORRELATION ENGINE

Calculate simple associations when sufficient data exists.

Examples:

### Sleep → Energy

> On days with ≥7 hours sleep, average energy was 7.4.

### Exercise → Mood

> Your recorded mood was higher on days with exercise.

### Creativity → Mood

> Your mood was higher after creative activities.

### Alcohol → Sleep

> Sleep quality was lower on recorded alcohol days.

Use neutral language.

Never imply medical causation.

Minimum:

**7 data points**

Prefer:

**14+ data points**

---

# 19. CRAVING TRACKER

Quick button:

**🍷 I'm craving alcohol**

Record:

* intensity 0–10
* trigger
* time
* situation
* intervention
* outcome

Triggers:

* Stress
* Boredom
* Conflict
* Social event
* Celebration
* Tiredness
* Habit
* Other

After recording, offer:

* Water
* Food
* Walk
* Shower
* Breathing
* Message someone
* Wait 10 minutes

---

# 20. EMERGENCY / "I FEEL BAD" BUTTON

Quick button:

**❤️ I don't feel well**

Record:

* current symptoms
* severity
* time
* sleep
* alcohol
* food
* hydration
* exercise
* optional blood pressure/pulse
* notes

This creates a detailed event that can later be reviewed.

The app must not diagnose the cause.

---

# 21. WEIGHT

Weight tracking is optional.

Show:

* current weight
* weekly average
* 30-day moving average
* long-term trend

Avoid emphasizing daily fluctuations.

Weight is secondary to wellbeing.

---

# 22. NUTRITION

Keep simple.

Track optionally:

* meals
* water
* protein
* fruit/vegetables
* caffeine
* notes

No large calorie database in MVP.

No pressure to lose weight.

---

# 23. EXERCISE

Activity types:

* Walking
* Strength
* BodyPump
* Running
* Cycling
* Swimming
* Yoga
* Other

Record:

* duration
* intensity
* notes

Optional:

* distance
* calories

---

# 24. JOURNAL

Daily notes.

Support:

* text
* photos
* tags

Tags:

* Good day
* Difficult day
* Creative
* Social
* Travel
* Stress
* Poor sleep
* Great sleep
* Alcohol craving
* Exercise
* Illness
* Achievement

---

# 25. CALENDAR

Yearly calendar.

Each day can show:

🟢 Alcohol-free
🟡 Partial data
🔴 Alcohol
✨ Creative activity
🏃 Exercise
❤️ Meaningful activity

Multiple indicators can coexist.

Click day → open daily record.

---

# 26. GAMIFICATION

Use **gentle gamification**.

Good:

* milestones
* streaks
* progress
* personal discoveries
* completed projects
* memories

Avoid:

* punishment
* guilt
* aggressive notifications
* "failure" language

If alcohol is consumed:

Do not display:

❌ YOU FAILED

Instead:

**Today was different. Your journey continues.**

Historical progress is preserved.

---

# 27. DATA MODEL

## User

* id
* name
* timezone
* createdAt

## Challenge

* id
* userId
* startDate
* endDate
* goalDays
* status

## DailyEntry

* id
* userId
* date
* alcoholConsumed
* alcoholAmount
* craving
* cravingIntensity
* energy
* mood
* stress
* motivation
* wellbeing
* stomach
* abdominalPain
* bloating
* nausea
* dizziness
* headache
* fatigue
* cough
* breathingDiscomfort
* sleepStart
* sleepEnd
* sleepDuration
* sleepQuality
* water
* caffeine
* mealCount
* weight
* waist
* notes

## ActivityEntry

* id
* userId
* date
* category
* activity
* duration
* enjoymentBefore
* enjoymentAfter
* energyBefore
* energyAfter
* moodBefore
* moodAfter
* notes

## ExerciseEntry

* id
* userId
* date
* type
* duration
* intensity
* distance
* calories
* notes

## CreativeProject

* id
* userId
* name
* category
* description
* startDate
* targetDate
* status
* notes

## ProjectMilestone

* id
* projectId
* title
* completed
* completedAt

## Interest

* id
* userId
* name
* category
* status

Statuses:

* idea
* interested
* tried
* loved
* notForMe

## CravingEntry

* id
* userId
* timestamp
* intensity
* trigger
* intervention
* outcome
* notes

## WellbeingEvent

* id
* userId
* timestamp
* type
* severity
* symptoms
* context
* notes

---

# 28. TECHNICAL STACK

MVP:

* React
* TypeScript
* Vite
* Tailwind CSS
* Recharts
* Dexie
* IndexedDB

Architecture:

**Local-first**

No backend required for MVP.

Design the data layer so that a backend can be added later.

---

# 29. PRIVACY

This application stores personal and potentially health-related information.

MVP:

* local storage only;
* no third-party analytics;
* no unnecessary external APIs;
* no data sharing.

Mandatory:

**Export all data**

Formats:

* JSON
* CSV

Also provide:

**Delete all data**

Future backend:

* authentication
* encryption
* secure cloud sync

---

# 30. PWA

The application should be installable as a mobile PWA.

Requirements:

* responsive
* mobile-first
* offline-capable
* fast launch
* local persistence

The user should be able to add it to the phone home screen.

---

# 31. Visual design

The design should feel:

* calm
* warm
* elegant
* personal
* optimistic
* slightly editorial
* premium

Avoid the visual language of:

* medical dashboards
* fitness punishment apps
* calorie trackers
* addiction treatment software

The app should feel more like:

**a beautiful personal journal + life dashboard.**

---

# 32. Dashboard concept

## MY YEAR

### DAY 4 / 365

`████░░░░░░`

---

### BODY

Alcohol-free      ✅
Sleep             7h 48m
Energy            7/10
Symptoms          ↓

---

### LIFE

🧵 Creative        45 min
🏃 Movement        42 min
❤️ Connection      Yes
✨ Enjoyment       8/10

---

### TODAY

[ Complete check-in ]

[ + Activity ]

[ + Exercise ]

[ 🍷 Craving ]

[ ❤️ I feel bad ]

---

### YOUR STORY

> "You spent 45 minutes sewing today."

> "You rated it 5/5."

---

# 33. MVP PRIORITY

### Phase 1

Build:

1. 365-day challenge
2. Dashboard
3. Daily check-in
4. Alcohol tracking
5. Symptoms
6. Sleep
7. Mood
8. Energy
9. Exercise
10. Activities
11. Creativity/hobbies
12. Projects
13. Calendar
14. Basic charts
15. IndexedDB persistence
16. JSON/CSV export

### Phase 2

1. Weekly review
2. Monthly review
3. Milestones
4. Craving tracker
5. Wellbeing event
6. Correlation engine
7. PWA
8. Photos
9. PDF/year report

### Phase 3

1. Cloud sync
2. Authentication
3. Apple Health
4. Google Health integrations
5. Advanced analytics
6. AI-generated reflections

---

# 34. IMPORTANT PRODUCT RULE

Do not turn this into another productivity app.

The user does NOT need to complete 15 habits every day.

The application should celebrate:

**showing up, exploring, noticing and learning.**

A day where the user:

* did not drink,
* slept badly,
* felt dizzy,
* watched a movie,
* and spent 20 minutes sewing

is still a meaningful day.

The app should help the user see that.

---

# 35. Definition of done

The MVP is complete when the user can:

1. Open the app.
2. See exactly where they are in the 365-day journey.
3. Complete a daily check-in in under 2 minutes.
4. Track alcohol.
5. Track physical symptoms.
6. Track sleep, mood and energy.
7. Track exercise.
8. Track hobbies and enjoyable activities.
9. Create personal projects.
10. Track creative projects such as sewing/clothing design.
11. Record how an activity affected mood and energy.
12. See historical data.
13. See trends.
14. View the year calendar.
15. Export all data.
16. Close and reopen the app without losing data.

---

# 36. Core emotional outcome

At the beginning of the year:

> "I want to stop drinking because I don't feel good."

At the end of the year:

> **"I learned what makes me feel good."**

That is the product.

---

# 37. Accepted implementation decisions

This section records the decisions accepted during the specification review and supersedes conflicting language above.

## Product model

* The product is a **Year Experiment**, not a streak that can be reset or failed.
* An **Alcohol-Free Day** is one observation within the Year Experiment.
* The MVP supports one **Local Profile** without authentication or multi-user UI.
* A **Personal Day** is a calendar date in the configured timezone. Completed daily records do not move when the timezone changes.
* One editable, incrementally saved **Daily Check-In** exists per Personal Day. Activities, exercises, cravings, and wellbeing events may have multiple timestamped records.
* Missing values are **Unknown Observations**, never zero or "no", and are excluded from derived claims.
* The canonical long-term exploration entity is **Project**. Creative is a category, not a separate entity type.

## Measures

* Symptoms and craving intensity use 0-10, where 0 means none.
* Mood, energy, stress, motivation, and overall wellbeing use 1-10.
* Activity enjoyment is a single post-activity score from 1-5.
* The default Daily Check-In contains alcohol, sleep, energy, mood, stress, and optional reflection.
* Optional symptoms and lifestyle measures use progressive disclosure and can be pinned into future check-ins.

## Dates and editing

* The first-run start date defaults to 30 August 2026 and is editable until the first Daily Check-In is recorded.
* Changing the start date after data exists requires an explicit warning because it renumbers the timeline.
* Records may be created or edited from the experiment start date through today.
* Future Daily Check-Ins are not allowed. Projects and milestones may have future target dates.

## Safety and language

* The app records symptoms but never diagnoses, infers medical causes, or presents medical conclusions.
* A static, reviewed safety notice directs users to appropriate emergency services for configured red-flag symptoms or extreme severity.
* Alcohol, symptom, and weight presentation uses neutral language and does not declare success or failure.
* The first release sends no notifications. Any future reminders must be optional, gentle, and free of streak-loss warnings.

## Analytics

* Associations require at least 14 eligible observations and at least 5 observations in each compared group.
* Every association reports sample size, excludes Unknown Observations, and uses cautious non-causal language.
* Percent changes are omitted when the baseline is too small or unstable.

## Persistence and privacy

* Dexie schema versions and forward migrations are explicit and tested from the first release.
* The MVP provides versioned, lossless JSON backup and restore. CSV is an analysis export and is not used for restoration.
* Delete all data requires typed confirmation, offers a JSON backup first, clears records and cached media, and returns to first-run setup.
* Photos are a Phase 2 capability. They will be resized, compressed, included in backups, and accompanied by storage-usage visibility.

## Delivery and quality

* PWA installation and offline relaunch are Phase 1 requirements.
* The accessibility target is WCAG 2.2 AA, including keyboard access, visible focus, screen-reader names, reduced motion, scalable text, 44-pixel touch targets, and non-color status cues.
* Supported browsers are the current and previous major versions of mobile Safari, Chrome, and Edge.
* Private browsing and unavailable persistent storage are unsupported but must be detected and explained clearly.
* The implementation follows the vertical slices and acceptance criteria in `docs/implementation-plan.md`.
* Automated release checks cover date boundaries, schema migrations, backup round trips, deletion, derived metrics, offline relaunch, and the primary mobile workflow.
