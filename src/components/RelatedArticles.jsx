function RelatedArticles({
  articles = [
    {
      author: "Tyler Dragon",
      time: "1h ago",
      title: "Eagles in danger of another late-season collapse",
      snippet:
        "The Philadelphia Eagles hardly resemble the team that won Super Bowl 59 just 10 months ago. The team's performance has significantly declined, raising concerns among fans and analysts alike. Injuries to key players and inconsistent offensive and defensive plays have contributed to their struggles. Many are questioning if they can recover and make a playoff push, or if this season is destined for another https://www.example.com/disappointing-finish. if they can recover and make a playoff push, or if this season is destined for another disappointing finish.if they can recover and make a playoff push, or if this season is destined for another disappointing finish.if they can recover and make a playoff push, or if this season is destined for another disappointing finish.if they can recover and make a playoff push, or if this season is destined for another disappointing finish.if they can recover and make a playoff push, or if this season is destined for another disappointing finish.if they can recover and make a playoff push, or if this season is destined for another disappointing finish.if they can recover and make a playoff push, or if this season is destined for another disappointing finish.if they can recover and make a playoff push, or if this season is destined for another disappointing finish.if they can recover and make a playoff push, or if this season is destined for another disappointing finish.if they can recover and make a playoff push, or if this season is destined for another disappointing finish.if they can recover and make a playoff push, or if this season is destined for another disappointing finish.",
      image:
        "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=800&auto=format&fit=crop",
    },
    {
      author: "Jack McKessy",
      time: "3h ago",
      title: "Breaking down Eagles' playoff chances after Week 14",
      snippet:
        "The Eagles' NFC East title hopes are on thin ice. Here's a look at the latest playoff odds. After a series of unexpected losses, their path to the postseason has become significantly harder. Visit https://sports.yahoo.com/nfl/ for more.",
      image:
        "https://images.unsplash.com/photo-1611004686355-6e0625a507f3?q=80&w=800&auto=format&fit=crop",
    },
    {
      author: "Tyler Dragon",
      time: "3h ago",
      title: "Chargers' sloppy OT win over Eagles: Winners & Losers",
      snippet:
        "The Los Angeles Chargers defeated the Philadelphia Eagles in overtime in a turnover-laden game. This match was a rollercoaster of emotions, with both teams making critical mistakes. Read more at http://www.nfl.com/news",
      image:
        "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop",
    },
    {
      author: "Sarah J. Smith",
      time: "5h ago",
      title: "Impact of new coaching strategies on team performance",
      snippet:
        "Exploring how recent tactical changes are affecting the team's overall game plan and results. The new strategies were implemented to improve offensive efficiency and defensive solidity. More details at https://strategy.com",
      image:
        "https://images.unsplash.com/photo-1546514714-72271810509a?q=80&w=800&auto=format&fit=crop",
    },
    {
      author: "Michael Brown",
      time: "Yesterday",
      title: "Key player injuries and their playoff implications",
      snippet:
        "A deep dive into the most significant player injuries and what they mean for the upcoming playoffs. Several star players are sidelined, raising concerns about the team's depth. See analysis at https://injuries.sports.com",
      image:
        "https://images.unsplash.com/photo-1560272564-c2bb74d6c415?q=80&w=800&auto=format&fit=crop",
    },
  ],
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: false,
  });

  const truncateAndLinkifySnippet = (text, limit = 500) => {
    if (!text) return null;

    const truncatedText = text.length > limit ? text.substring(0, limit) + "..." : text;

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const parts = truncatedText.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {part}
          </a>
        );
      }

      return part;
    });
  };

  return (
    <Card className="w-full bg-[#0B0E1E] text-slate-300 border border-slate-800 shadow-2xl overflow-hidden font-sans">
      <CardHeader className="px-5 py-4 border-b border-slate-800 flex flex-row items-center justify-end bg-[#0f1225]">
        <Badge
          variant="outline"
          className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20 font-medium"
        >
          {articles.length} stories
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-4 p-2">
              {articles.map((item, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <a
                    href="#"
                    className="group flex flex-col h-full rounded-lg overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-colors duration-200 bg-[#0f1225]"
                  >
                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 font-medium">
                        <span className="text-blue-400">{item.author}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span>{item.time}</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-100 leading-snug mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-400 leading-relaxed opacity-80 flex-grow">
                        {truncateAndLinkifySnippet(item.snippet, 500)}
                      </p>
                    </div>
                  </a>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 
              bg-slate-700/60 hover:bg-slate-700 text-white 
              border border-slate-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </CarouselPrevious>

            <CarouselNext
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 
              bg-slate-700/60 hover:bg-slate-700 text-white 
              border border-slate-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </CarouselNext>
          </Carousel>
        </div>
      </CardContent>
    </Card>
  );
}
