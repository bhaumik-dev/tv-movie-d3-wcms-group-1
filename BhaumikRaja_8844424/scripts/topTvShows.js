// Setting the dimensions and margins of the graph
const margin = { top: 20, right: 50, bottom: 50, left: 200 },
  width = 1200 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

const svg = d3
  .select("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Creating a tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Using refined color palette
const colorPalette = d3.scaleOrdinal(d3.schemeBlues[5].slice(1));

// Parsing the data
d3.json("data/tvShows.json").then((data) => {
  // Sort data by rating
  data.sort((a, b) => b.rating - a.rating);

  // Adding X axis
  const x = d3.scaleLinear().domain([0, 10]).range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Adding Y axis
  const y = d3
    .scaleBand()
    .range([0, height])
    .domain(data.map((d) => d.title))
    .padding(0.1);
  svg.append("g").call(d3.axisLeft(y));

  // Bars
  const bars = svg
    .selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d.title))
    .attr("width", 0)
    .attr("height", y.bandwidth())
    .attr("class", "bar")
    .style("fill", (d, i) => colorPalette(i % colorPalette.range().length))
    .on("mouseover", function (event, d) {
      const currentColor = d3.select(this).style("fill");
      d3.select(this)
        .transition()
        .duration(200)
        .style("fill", d3.rgb(currentColor).darker(1));

      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `<img src="${d.image}" alt="${d.title}" style="width: 200px; height: auto;"><br>Title: ${d.title}<br>Rating: ${d.rating}`
        )
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .style("fill", function () {
          const originalColor = colorPalette(
            data.indexOf(d) % colorPalette.range().length
          );
          return originalColor;
        });

      tooltip.transition().duration(500).style("opacity", 0);
    })
    .transition() // Starting the transition
    .delay((d, i) => i * 100) // delay
    .duration(800)
    .attr("width", (d) => x(d.rating)); //Growing to final width
});
