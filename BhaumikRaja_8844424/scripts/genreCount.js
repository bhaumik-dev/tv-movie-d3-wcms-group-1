// Setting the dimensions and margins of the graph
const width = 900;
const height = 700;
const margin = 120;

// The radius is half the width or half the height (smallest one).
const radius = Math.min(width, height) / 2 - margin;

// Appending the svg object to the div
const svg = d3
  .select("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Creating a tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute");

// Reading the data
d3.json("data/genreCount.json").then((data) => {
  // Converting data object to array of key-value pairs
  const dataArray = Object.entries(data).map(([key, value]) => ({
    key,
    value,
  }));

  // Fetching all shows data with images
  d3.json("data/tvShows.json").then((shows) => {
    // Set the color scale
    const color = d3
      .scaleOrdinal()
      .domain(dataArray.map((d) => d.key))
      .range(d3.schemeSet2);

    // Computing the position of each group on the donut
    const pie = d3.pie().value((d) => d.value);
    const data_ready = pie(dataArray);

    // Define the arc for the donut chart
    const arc = d3
      .arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);
    const arcHover = d3
      .arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius + 10);

    // Building the donut chart
    svg
      .selectAll("path")
      .data(data_ready)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.key))
      .attr("stroke", "black")
      .style("stroke-width", "2px")
      .style("opacity", 0.7)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arcHover)
          .style("opacity", 1);
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc)
          .style("opacity", 0.7);
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        const genre = d.data.key;
        const genreShows = shows.filter((show) => show.genres.includes(genre));
        const imagesHtml = genreShows
          .map(
            (show) =>
              `<div style="text-align: center;">
                <img src="${show.image}" alt="${show.title}" style="width: 100px; height: auto; margin: 5px;">
                <div style="color: white;">Rating: ${show.rating}</div>
              </div>`
          )
          .join("");
        tooltip
          .style("opacity", 0.9)
          .html(
            `<div style="display: flex; flex-wrap: nowrap; gap: 10px;">${imagesHtml}</div>`
          )
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 28 + "px");

        // Prevent tooltip from hiding when clicking inside it
        tooltip.on("click", function (event) {
          event.stopPropagation();
        });
      })
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const i = d3.interpolate(d.startAngle, d.endAngle);
        return function (t) {
          d.endAngle = i(t);
          return arc(d);
        };
      });

    // Adding polylines between chart and labels
    svg
      .selectAll("polyline")
      .data(data_ready)
      .enter()
      .append("polyline")
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr("points", function (d) {
        const posA = arc.centroid(d);
        const posB = d3
          .arc()
          .innerRadius(radius)
          .outerRadius(radius + 10)
          .centroid(d); // line break
        const posC = d3
          .arc()
          .innerRadius(radius)
          .outerRadius(radius + 30)
          .centroid(d); // Label position
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // Changing the position of the label based on the midangle
        const posD = [posC[0] + (midangle < Math.PI ? 1 : -1) * 30, posC[1]]; // Label position
        return [posA, posB, posD];
      });

    // Adding the polylines' text labels
    svg
      .selectAll("text")
      .data(data_ready)
      .enter()
      .append("text")
      .text((d) => `${d.data.key} (${d.data.value} shows)`)
      .attr("transform", function (d) {
        const pos = d3
          .arc()
          .innerRadius(radius)
          .outerRadius(radius + 30)
          .centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = pos[0] + (midangle < Math.PI ? 1 : -1) * 30;
        return `translate(${pos})`;
      })
      .style("text-anchor", function (d) {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midangle < Math.PI ? "start" : "end";
      })
      .style("font-size", 15)
      .transition()
      .duration(1000)
      .attrTween("transform", function (d) {
        const pos = d3
          .arc()
          .innerRadius(radius)
          .outerRadius(radius + 30)
          .centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = pos[0] + (midangle < Math.PI ? 1 : -1) * 30;
        const interpolate = d3.interpolateArray([0, 0], pos);
        return function (t) {
          return `translate(${interpolate(t)})`;
        };
      });
  });
});

// Hiding tooltip when clicking outside
d3.select("body").on("click", function () {
  d3.select(".tooltip").style("opacity", 0);
});
