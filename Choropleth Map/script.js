const hght = 900;
const wdth = 1000;
const padding = 70;

const fillColorsData = [
  { color: "rgba(0,100,0,0.15)", range: "0% -" },
  { color: "rgba(0,100,0,0.25)", range: "12% -" },
  { color: "rgba(0,100,0,0.35)", range: "21% -" },
  { color: "rgba(0,100,0,0.45)", range: "30% -" },
  { color: "rgba(0,100,0,0.55)", range: "39% -" },
  { color: "rgba(0,100,0,0.65)", range: "48% -" },
  { color: "rgba(0,100,0,0.85)", range: "57% -" },
  { color: "rgb(0,100,0)", range: "66% -" }
];

const legendDataBaseX = wdth / 25;

const fetchUsEducationData = async () => {
  try {
    const res = await fetch(
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
    );
    const usEducationData = await res.json();

    const fetchUsCountyData = async () => {
      try {
        const resTwo = await fetch(
          "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
        );
        const usGeoData = await resTwo.json();

        const usGeoDataInTopoJson = Object.keys(usGeoData.objects).map((key) =>
          topojson.feature(usGeoData, usGeoData.objects[key])
        );

        const usCountyDataInTopoJson = usGeoDataInTopoJson[0].features;
        //const usStateDataInTopoJson = usGeoDataInTopoJson[1].features;
        //console.log(usStateDataInTopoJson)

        const svg = d3
          .select("body")
          .append("svg")
          .attr("height", hght)
          .attr("width", wdth)
          .style("margin-top", "3rem")
          
        svg
          .append("text")
          .attr("id", "title")
          .text("United States Educational Attainment")
          .attr("x", wdth / 4.6)
          .attr("y", padding * 1.1)
          .attr("font-size", "2rem")
          .attr("font-weight", "900")
          .append("tspan")
          .text(
            "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
          )
          .attr("id", "description")
          .attr("x", wdth / 4)
          .attr("y", padding * 1.5)
          .attr("font-size", "0.8rem")
          .attr("font-weight", "bold")
                
        svg
          .selectAll("path")
          .data(usCountyDataInTopoJson)
          .enter()
          .append("path")
          .attr("class", "county")
          .attr("data-fips", (d, i) => d.id )
          .attr("data-education", (d) => getDataValue(d, usEducationData, "bachelorsOrHigher"))
          .attr("data-state", (d) => getDataValue(d, usEducationData, "state"))
          .attr("data-areaName", (d) => getDataValue(d, usEducationData, "area_name"))
          .attr("d", d3.geoPath())
          .attr(
            "transform",
            "translate(" + padding / 2 + ", " + padding * 3 + ")"
          )
          .attr("fill", (d) => setFillColor(getDataValue(d, usEducationData, "bachelorsOrHigher")))
          .attr("stroke", "white")
          .attr("stroke-width", "0.25")
          .on("mouseover", (event) => {
            const x = event.pageX;
            const y = event.pageY;
            const county = event.target;
          
            d3.select("#tooltip")
              .classed("invisible", false)
              .attr("data-education", county.getAttribute("data-education"))
              .style("top", y + "px")
              .style("left", x + "px")
              .style("background-color", "whitesmoke")
              .text(
                county.getAttribute("data-areaName") +
                  ", " +
                  county.getAttribute("data-state") +
                  " " +
                  county.getAttribute("data-education") +
                  "%"
              );
          })
          .on("mouseout", () =>
            d3.select("#tooltip").classed("invisible", "true")
          );

        d3.select("body")
          .append("div")
          .attr("id", "tooltip")
          .attr("class", "invisible")
          .style("width", "max-content")
          .style("height", "max-content")
          .style("position", "absolute")
          .style("padding", "1rem")
          .style("border-radius", "5px");

        const legend = svg
          .append("g")
          .attr("id", "legend")
          .attr("transform", "translate(" + wdth / 2 + ", " + (padding * 2) + ")");

        legend
          .selectAll("rect")
          .data(fillColorsData)
          .enter()
          .append("rect")
          .attr("width", legendDataBaseX)
          .attr("height", 20)
          .attr("fill", (d) => d.color)
          .attr("x", (_d, i) => legendDataBaseX * i)
          .attr("y", padding / 1.5);

        legend
          .selectAll("text")
          .data(fillColorsData)
          .enter()
          .append("text")
          .text(d => d.range)
          .attr("x", (_d, i) => (legendDataBaseX * i) + (legendDataBaseX / 6))
          .attr("y", padding / 1.6)
          .style("font-size", "0.8rem")
        
        /* svg
          .selectAll("path")
          .data(usStateDataInTopoJson)
          .enter()
          .append("path")
          .attr("class", "state")
        .attr("d", d3.geoPath())
          .attr("transform", "translate(" + (padding / 2) + ", " + (padding * 1.7) + ")")
          .attr("stroke", "black")*/
      } catch {
        console.log("Error");
      }
    };

    fetchUsCountyData();
  } catch {
    console.log("Error occurred");
  }
};

fetchUsEducationData();

function getDataValue(data, baseData, baseDataValue) {
  let dataValue = ""
  for(let index = 0; index < baseData.length; index++) {
    if(data.id === baseData[index].fips) {
      dataValue = baseData[index][baseDataValue]
      break; 
    }
  } return dataValue
}

function setFillColor(educationPercentage) {
  let fillColor = "";
  if (educationPercentage >= 0 && educationPercentage < 12)
    fillColor = fillColorsData[0].color;
  else if (educationPercentage >= 12 && educationPercentage < 21)
    fillColor = fillColorsData[1].color;
  else if (educationPercentage >= 21 && educationPercentage < 30)
    fillColor = fillColorsData[2].color;
  else if (educationPercentage >= 30 && educationPercentage < 39)
    fillColor = fillColorsData[3].color;
  else if (educationPercentage >= 39 && educationPercentage < 48)
    fillColor = fillColorsData[4].color;
  else if (educationPercentage >= 48 && educationPercentage < 57)
    fillColor = fillColorsData[5].color;
  else if (educationPercentage >= 57 && educationPercentage < 66)
    fillColor = fillColorsData[6].color;
  else fillColor = fillColorsData[7].color;
 
  return fillColor;
}
