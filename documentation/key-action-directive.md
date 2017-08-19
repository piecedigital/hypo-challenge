# Key Action - Directive

This directive's purpose is key in the user suggestion feature. Its function is to check if the user wants to be mentioning someone, and provides start and end points for the text in the textarea.

The `onChange` function from `SearchController` was not adequate for this purpose as I needed it to trigger beyond just text changes; it also needed to trigger for arrow key. So this event is a `keyup` event.
