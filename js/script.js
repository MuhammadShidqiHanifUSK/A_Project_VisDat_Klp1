// =========================
// GLOBAL VARIABLES
// =========================

let originalData = [];
let filteredData = [];

const tooltip = d3.select("#tooltip");

// =========================
// LOAD CSV
// =========================

d3.csv("../data/processed/hotel_bookings_preprocessed.csv")
  .then((data) => {
    data.forEach((d) => {
      d.is_canceled = +d.is_canceled;
      d.lead_time = +d.lead_time;
      d.adr = +d.adr;
      d.arrival_date_year = +d.arrival_date_year;
    });

    originalData = data;
    filteredData = data;

    initializeFilters();
    updateDashboard();
  })
  .catch((error) => {
    console.error(error);
  });

// =========================
// FILTER EVENTS
// =========================

function initializeFilters() {
  d3.select("#hotelFilter").on("change", applyFilters);

  d3.select("#yearFilter").on("change", applyFilters);

  d3.select("#statusFilter").on("change", applyFilters);

  d3.select("#segmentFilter").on("change", applyFilters);

  d3.select("#depositFilter").on("change", applyFilters);

  d3.select("#resetBtn").on("click", resetFilters);
}

// =========================
// RESET FILTERS
// =========================

function resetFilters() {
  d3.select("#hotelFilter").property("value", "All");

  d3.select("#yearFilter").property("value", "All");

  d3.select("#statusFilter").property("value", "All");

  d3.select("#segmentFilter").property("value", "All");

  d3.select("#depositFilter").property("value", "All");

  filteredData = originalData;

  updateDashboard();
}

// =========================
// APPLY FILTERS
// =========================

function applyFilters() {
  const hotel = d3.select("#hotelFilter").property("value");

  const year = d3.select("#yearFilter").property("value");

  const status = d3.select("#statusFilter").property("value");

  const segment = d3.select("#segmentFilter").property("value");

  const deposit = d3.select("#depositFilter").property("value");

  filteredData = originalData.filter((d) => {
    const hotelMatch = hotel === "All" || d.hotel === hotel;

    const yearMatch = year === "All" || +d.arrival_date_year === +year;

    const statusMatch = status === "All" || d.reservation_status === status;

    // =====================
    // MARKET SEGMENT
    // =====================

    let segmentMatch = true;

    if (segment !== "All") {
      const segmentColumn = `market_segment_${segment}`;

      segmentMatch = String(d[segmentColumn]).toLowerCase() === "true";
    }

    // =====================
    // DEPOSIT TYPE
    // =====================

    let depositMatch = true;

    if (deposit !== "All") {
      const depositColumn = `deposit_type_${deposit}`;

      depositMatch = String(d[depositColumn]).toLowerCase() === "true";
    }

    return (
      hotelMatch && yearMatch && statusMatch && segmentMatch && depositMatch
    );
  });

  console.log("Filtered Rows:", filteredData.length);

  updateDashboard();
}

// =========================
// UPDATE DASHBOARD
// =========================

function updateDashboard() {
  updateKPIs(filteredData);

  drawLineChart(filteredData);

  drawCountryChart(filteredData);

  drawMarketChart(filteredData);

  drawScatterPlot(filteredData);

  updateInsights(filteredData);
}

// =========================
// KPI
// =========================

function updateKPIs(data) {
  const totalBookings = data.length;

  const canceled = data.filter((d) => d.is_canceled === 1).length;

  const cancelRate = totalBookings
    ? ((canceled / totalBookings) * 100).toFixed(2)
    : 0;

  const avgADR = d3.mean(data, (d) => d.adr) || 0;

  const avgLead = d3.mean(data, (d) => d.lead_time) || 0;

  d3.select("#totalBookings").text(d3.format(",")(totalBookings));

  d3.select("#cancelRate").text(cancelRate + "%");

  d3.select("#avgADR").text(avgADR.toFixed(2));

  d3.select("#avgLead").text(avgLead.toFixed(2));
}

// =====================================
// LINE CHART
// =====================================

function drawLineChart(data) {
  d3.select("#lineChart").html("");

  const margin = {
    top: 40,
    right: 40,
    bottom: 60,
    left: 70,
  };

  const width = 1000 - margin.left - margin.right;

  const height = 450 - margin.top - margin.bottom;

  const svg = d3
    .select("#lineChart")
    .append("svg")
    .attr("viewBox", "0 0 1000 450")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthlyData = monthOrder.map((month) => {
    const rows = data.filter((d) => d.arrival_date_month === month);

    return {
      month: month,

      bookings: rows.length,

      canceled: rows.filter((d) => d.is_canceled === 1).length,
    };
  });

  const x = d3
    .scalePoint()

    .domain(monthOrder)

    .range([0, width]);

  const y = d3
    .scaleLinear()

    .domain([0, d3.max(monthlyData, (d) => Math.max(d.bookings, d.canceled))])

    .nice()

    .range([height, 0]);

  svg
    .append("g")

    .attr("transform", `translate(0,${height})`)

    .call(d3.axisBottom(x));

  svg
    .append("g")

    .call(d3.axisLeft(y));

  const bookingLine = d3
    .line()

    .x((d) => x(d.month))

    .y((d) => y(d.bookings));

  const cancelLine = d3
    .line()

    .x((d) => x(d.month))

    .y((d) => y(d.canceled));

  // BOOKING LINE

  svg
    .append("path")

    .datum(monthlyData)

    .attr("fill", "none")

    .attr("stroke", "#2563eb")

    .attr("stroke-width", 3)

    .attr("d", bookingLine);

  // CANCEL LINE

  svg
    .append("path")

    .datum(monthlyData)

    .attr("fill", "none")

    .attr("stroke", "#ef4444")

    .attr("stroke-width", 3)

    .attr("d", cancelLine);

  // BLUE POINTS

  svg
    .selectAll(".bookingDot")

    .data(monthlyData)

    .enter()

    .append("circle")

    .attr("cx", (d) => x(d.month))

    .attr("cy", (d) => y(d.bookings))

    .attr("r", 5)

    .attr("fill", "#2563eb")

    .on("mouseover", function (event, d) {
      tooltip

        .style("opacity", 1)

        .html(
          `

            <b>${d.month}</b>
            <br>
            Bookings:
            ${d.bookings}

        `,
        )

        .style("left", event.pageX + 15 + "px")

        .style("top", event.pageY - 20 + "px");
    })

    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // RED POINTS

  svg
    .selectAll(".cancelDot")

    .data(monthlyData)

    .enter()

    .append("circle")

    .attr("cx", (d) => x(d.month))

    .attr("cy", (d) => y(d.canceled))

    .attr("r", 5)

    .attr("fill", "#ef4444")

    .on("mouseover", function (event, d) {
      tooltip

        .style("opacity", 1)

        .html(
          `

            <b>${d.month}</b>
            <br>
            Cancelled:
            ${d.canceled}

        `,
        )

        .style("left", event.pageX + 15 + "px")

        .style("top", event.pageY - 20 + "px");
    })

    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // =====================================
  // TOP 10 GUEST COUNTRIES
  // =====================================

  function drawCountryChart(data) {
    d3.select("#countryChart").html("");

    const margin = {
      top: 40,
      right: 30,
      bottom: 80,
      left: 70,
    };

    const width = 900 - margin.left - margin.right;

    const height = 450 - margin.top - margin.bottom;

    const svg = d3
      .select("#countryChart")
      .append("svg")
      .attr("viewBox", "0 0 900 450")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // TOP 10 COUNTRY

    const countryData = d3
      .rollups(
        data,

        (v) => v.length,

        (d) => d.country,
      )

      .sort((a, b) => b[1] - a[1])

      .slice(0, 10);

    const x = d3
      .scaleBand()

      .domain(countryData.map((d) => d[0]))

      .range([0, width])

      .padding(0.2);

    const y = d3
      .scaleLinear()

      .domain([0, d3.max(countryData, (d) => d[1])])

      .nice()

      .range([height, 0]);

    // X AXIS

    svg
      .append("g")

      .attr("transform", `translate(0,${height})`)

      .call(d3.axisBottom(x))

      .selectAll("text")

      .attr("transform", "rotate(-30)")

      .style("text-anchor", "end");

    // Y AXIS

    svg
      .append("g")

      .call(d3.axisLeft(y));

    // BAR

    svg
      .selectAll("rect")

      .data(countryData)

      .enter()

      .append("rect")

      .attr("x", (d) => x(d[0]))

      .attr("y", (d) => y(d[1]))

      .attr("width", x.bandwidth())

      .attr("height", (d) => height - y(d[1]))

      .attr("fill", "#2563eb")

      .attr("rx", 5)

      .on("mouseover", function (event, d) {
        tooltip

          .style("opacity", 1)

          .html(
            `

            <b>${d[0]}</b>
            <br>
            Bookings:
            ${d[1]}

        `,
          )

          .style("left", event.pageX + 15 + "px")

          .style("top", event.pageY - 20 + "px");
      })

      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // VALUE LABEL

    svg
      .selectAll(".value")

      .data(countryData)

      .enter()

      .append("text")

      .attr("x", (d) => x(d[0]) + x.bandwidth() / 2)

      .attr("y", (d) => y(d[1]) - 8)

      .attr("text-anchor", "middle")

      .style("font-size", "11px")

      .style("font-weight", "600")

      .text((d) => d[1]);

    // TITLE

    svg
      .append("text")

      .attr("x", width / 2)

      .attr("y", -15)

      .attr("text-anchor", "middle")

      .style("font-size", "18px")

      .style("font-weight", "bold")

      .text("Top 10 Guest Countries");
  }
}

// =====================================
// MARKET SEGMENT ANALYSIS
// =====================================

function drawMarketChart(data) {
  d3.select("#marketChart").html("");

  const segments = [
    "Aviation",
    "Complementary",
    "Corporate",
    "Direct",
    "Groups",
    "Offline TA/TO",
    "Online TA",
  ];

  const chartData = segments.map((segment) => {
    const column = `market_segment_${segment}`;

    const segmentRows = data.filter(
      (d) => String(d[column]).toLowerCase() === "true",
    );

    const canceled = segmentRows.filter((d) => d.is_canceled == 1).length;

    const notCanceled = segmentRows.filter((d) => d.is_canceled == 0).length;

    return {
      segment,
      canceled,
      notCanceled,
      total: canceled + notCanceled,
    };
  });

  const margin = {
    top: 20,
    right: 80,
    bottom: 50,
    left: 150,
  };

  const width = 800 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const svg = d3
    .select("#marketChart")
    .append("svg")
    .attr("viewBox", "0 0 800 450")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(chartData, (d) => d.total)])
    .nice()
    .range([0, width]);

  const y = d3
    .scaleBand()
    .domain(chartData.map((d) => d.segment))
    .range([0, height])
    .padding(0.2);

  // Axis

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Not Canceled (Biru)

  svg
    .selectAll(".notCanceled")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d) => y(d.segment))
    .attr("height", y.bandwidth())
    .attr("width", (d) => x(d.notCanceled))
    .attr("fill", "#2563eb")
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(
          `
                    <b>${d.segment}</b><br>
                    Not Canceled: ${d.notCanceled}<br>
                    Canceled: ${d.canceled}<br>
                    Total: ${d.total}
                `,
        )
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  // Canceled (Oranye)

  svg
    .selectAll(".canceled")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.notCanceled))
    .attr("y", (d) => y(d.segment))
    .attr("height", y.bandwidth())
    .attr("width", (d) => x(d.canceled))
    .attr("fill", "#f97316")
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(
          `
                    <b>${d.segment}</b><br>
                    Not Canceled: ${d.notCanceled}<br>
                    Canceled: ${d.canceled}<br>
                    Total: ${d.total}
                `,
        )
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  // Label Total

  svg
    .selectAll(".totalLabel")
    .data(chartData)
    .enter()
    .append("text")
    .attr("x", (d) => x(d.total) + 5)
    .attr("y", (d) => y(d.segment) + y.bandwidth() / 2 + 4)
    .style("font-size", "11px")
    .style("font-weight", "600")
    .text((d) => d.total);
}

// =====================================
// ADR vs LEAD TIME SCATTER PLOT
// =====================================

function drawScatterPlot(data) {
  d3.select("#scatterChart").html("");

  if (data.length === 0) {
    d3.select("#scatterChart")
      .append("p")
      .style("text-align", "center")
      .style("padding", "50px")
      .text("No data available");

    return;
  }

  const margin = {
    top: 20,
    right: 20,
    bottom: 60,
    left: 70,
  };

  const width = 1000 - margin.left - margin.right;

  const height = 520 - margin.top - margin.bottom;

  const svg = d3
    .select("#scatterChart")
    .append("svg")
    .attr("viewBox", "0 0 1000 520")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Debug jumlah hotel
  console.log(
    "Hotel Distribution:",
    d3.rollup(
      data,
      (v) => v.length,
      (d) => d.hotel,
    ),
  );

  // X Scale
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.lead_time)])
    .nice()
    .range([0, width]);

  // Y Scale
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.adr)])
    .nice()
    .range([height, 0]);

  // X Axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Y Axis
  svg.append("g").call(d3.axisLeft(y));

  // X Label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "600")
    .text("Lead Time");

  // Y Label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "600")
    .text("ADR");

  // =====================
  // POINTS
  // =====================

  svg
    .selectAll(".point")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "point")

    .attr(
      "transform",
      (d) =>
        `translate(
                ${x(d.lead_time)},
                ${y(d.adr)}
            )`,
    )

    .attr("d", (d) => {
      const hotel = String(d.hotel).trim();

      // Resort Hotel = Kotak
      if (hotel === "Resort Hotel") {
        return d3.symbol().type(d3.symbolSquare).size(25)();
      }

      // City Hotel = Lingkaran
      return d3.symbol().type(d3.symbolCircle).size(25)();
    })

    .attr("fill", (d) => (d.is_canceled === 1 ? "#ef4444" : "#2563eb"))

    .attr("opacity", 0.45)

    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(
          `
                        <b>${d.hotel}</b><br>
                        Lead Time:
                        ${d.lead_time.toFixed(2)}<br>
                        ADR:
                        ${d.adr.toFixed(2)}<br>
                        Status:
                        ${d.is_canceled === 1 ? "Canceled" : "Successful"}
                    `,
        )

        .style("left", event.pageX + 15 + "px")

        .style("top", event.pageY - 20 + "px");
    })

    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });
}

function updateInsights(data) {
  if (data.length === 0) {
    d3.select("#insights").html("<p>No data available.</p>");

    return;
  }

  // Total booking
  const totalBookings = data.length;

  // Cancellation rate
  const canceled = data.filter((d) => d.is_canceled === 1).length;

  const cancelRate = ((canceled / totalBookings) * 100).toFixed(1);

  // Average ADR
  const avgADR = d3.mean(data, (d) => d.adr).toFixed(2);

  // Average Lead Time
  const avgLead = d3.mean(data, (d) => d.lead_time).toFixed(2);

  // Top Country
  const topCountry = d3
    .rollups(
      data,
      (v) => v.length,
      (d) => d.country,
    )
    .sort((a, b) => b[1] - a[1])[0];

  // Hotel Type Dominan
  const topHotel = d3
    .rollups(
      data,
      (v) => v.length,
      (d) => d.hotel,
    )
    .sort((a, b) => b[1] - a[1])[0];

  d3.select("#insights").html(`
        <h3>Dashboard Insights</h3>
        <ul>
            <li>
                Total bookings:
                <b>${totalBookings.toLocaleString()}</b>
            </li>

            <li>
                Cancellation rate:
                <b>${cancelRate}%</b>
            </li>

            <li>
                Average ADR:
                <b>${avgADR}</b>
            </li>

            <li>
                Average Lead Time:
                <b>${avgLead}</b>
            </li>

            <li>
                Top guest country:
                <b>${topCountry[0]}</b>
                (${topCountry[1]} bookings)
            </li>

            <li>
                Dominant hotel type:
                <b>${topHotel[0]}</b>
            </li>
        </ul>
    `);
}
