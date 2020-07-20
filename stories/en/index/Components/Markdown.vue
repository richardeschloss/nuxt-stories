<!-- eslint-disable -->
<template>
  <markdown>
    # This is a heading

    ## This is a sub-heading

    ### Here are some bullets:

    * Bullet 1
    * Bullet 2
    * Bullet 3

    ### Here is the logo component:

    <stories-logo />

    ### Here is JS code:

    ```js
    var a = 123
    function fn1() {
      return 42
    }
    ```

    Text can be bolded with HTML ```<b></b>``` tags: <b>BOLD</b> text

    Or we can use markdown with double asterisks: **BOLD** text

    This is a table:
    <div style="width: 50%;">

    | Tables        | Are           | Cool  |
    | ------------- |:-------------:| -----:|
    | col 3 is      | right-aligned | $1600 |
    | col 2 is      | centered      |   $12 |
    | zebra stripes | are neat      |    $1 |

    </div>
  </markdown>
</template>
