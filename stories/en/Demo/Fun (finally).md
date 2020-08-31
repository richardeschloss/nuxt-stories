---
  title: Fun with videos
  order: 4
  videos:
  - https://test-videos.co.uk/vids/jellyfish/mp4/h264/1080/Jellyfish_1080_10s_1MB.mp4
  - https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4
---

# Video1 (provide data)

<video width="400" :src="videos[1]" controls autoplay />

We can quickly change the video just by changing the 0 to a 1!

We can add features...

# Video 2 (provide string)
<video width="400" src="https://test-videos.co.uk/vids/jellyfish/mp4/h264/1080/Jellyfish_1080_10s_1MB.mp4" controls />


Just like we can use our own components, we can also use standard HTML5 tags. This includes video.

We can refer to videos in two ways:

1. Using the data at the top
  - This method will require us to specify ":src"

2. Using provided strings.
  - This method will require us to specify "src"

Notice the difference...the ":" before the attribute means to treat the value as data provided from the top (i.e., to be compiled)

Let's try it out!!

