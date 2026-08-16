# Frequency Friend

## Idea

An anki-like app that uses a flash card system in conjunction with spaced repetition to help music students drill different concepts.

For our MVP, we will be building single note recognition for the trumpet. What this will require is:

- Generate a series of "flash cards" to display to the user for each practice session
- Each card will show a single note on a traditional music staff.
- the user will select the Pitch name (ie., A, B, C, D, E, F, G) and the app will show the user whether they are correct or not
- The app will track the user's success on each note in a spaced-repetition engine that will drive the current and subsequent sessions, similar to the anki app. (If this engine is open source and available, we should avail ourselves of that library, rather than recreating from scractch, if practical)
- Initial light configuration will include a floor and ceiling to the range within which the notes can be selected, a preferred staff (bass, treble, grand staff, alto, and tenor), and ability to toggle accidentals on and off
- When "trumpet mode" is selected, both the pitch and the fingering will be selectable, and the pitch that plays must be transposed to match the trumpet (if the user is using a Bb trumpet)
- After identifying the note, the student can optionally play or sing the note. The app will count them in with 2 or 4 beats (configurable) at a specified tempo, and then record how long they can hold the note. We can call this "long tone mode"

## Personas

### Beginning Trumpet Student

This student wants to participate in brief, effective sessions that will help them learn to recognize, name, and play or sing pitches on the staff.
The student wants to be quizzed on notes they struggle to recognize, name, or play.
The student wants to be able to set the range of notes they will be quizzed on, including whether or not the quizzed notes include accidentals (C#, Eb, etc.)
When prompted to play the note, they should be given a configurable number of beats to count them in, and then the app will help them track how long they are able to hold the individual note.

## Tech Stack

Initially, the bulk of the work here will be in the front end. We might want to eventually support accounts, saving progress across devices, etc., but for now, let's build a self-contained front end app and save flash card performance and progress in the browser memory.

The client side will be built without front end frameworks (No react, no vue, no svelte) - we'll use typescript and then compile to js using tsc. The goal is maintainable, readable, and low complexity. Aim to use the browser APIs whenever possible, and always ask before integrating new libraries.
WebComponents can be used to manage and support modular development.
For example, we'll just use the WebAudio API for any pitch generation or processing/play back. I want the app to be lightning fast, to build almost instantly, and deploys must be simple and fast.

The same goes for CSS - just use vanilla CSS, aim for plain, readable, simple implementations. Don't be fancy or clever.

## Questions before Implementing

Agent should record questions here before kicking off any development.
