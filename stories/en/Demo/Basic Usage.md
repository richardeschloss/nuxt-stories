---
  title: Basic Usage
  order: 1
---

The left pane is where we write our stories. The right is where we see the compiled output instantly. This pane uses a format called Markdown. It also respects VUE syntax.

It also respects VUE syntax.

So, the following will get compiled:

- Italics: *{{ title }}*
- Bold: **{{ title }}**

We can also create a table quickly:

| first name | last name | email |
| --- | --- | --- |
| John | Smith | someone@gmail.com |
| Jill | Smith | someoneelse@yahoo.com |

We can also quickly invoke a component like the logo:

<stories-logo width="200" />

We can make it bigger by adjusting it's properties. 
