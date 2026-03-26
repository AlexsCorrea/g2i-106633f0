// WHO Child Growth Standards - Reference data with LMS parameters for Z-score calculation
// Based on WHO Multicentre Growth Reference Study (0-5y) and WHO Reference 2007 (5-19y)
// Values represent P3, P15, P50 (median), P85, P97 percentiles

export interface GrowthReferencePoint {
  ageMonths: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
  // LMS parameters for z-score calculation
  L?: number; // Box-Cox power
  M?: number; // Median
  S?: number; // Coefficient of variation
}

export interface GrowthReferenceSet {
  male: GrowthReferencePoint[];
  female: GrowthReferencePoint[];
}

// === WEIGHT (kg) by age in months ===
export const weightReference: GrowthReferenceSet = {
  male: [
    { ageMonths: 0, p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.4, L: 0.3487, M: 3.3464, S: 0.14602 },
    { ageMonths: 1, p3: 3.4, p15: 3.9, p50: 4.5, p85: 5.1, p97: 5.8, L: 0.2297, M: 4.4709, S: 0.13395 },
    { ageMonths: 2, p3: 4.3, p15: 4.9, p50: 5.6, p85: 6.3, p97: 7.1, L: 0.1970, M: 5.5675, S: 0.12385 },
    { ageMonths: 3, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.2, p97: 8.0, L: 0.1738, M: 6.3762, S: 0.11727 },
    { ageMonths: 4, p3: 5.6, p15: 6.2, p50: 7.0, p85: 7.8, p97: 8.7, L: 0.1553, M: 7.0023, S: 0.11316 },
    { ageMonths: 5, p3: 6.0, p15: 6.7, p50: 7.5, p85: 8.4, p97: 9.3, L: 0.1395, M: 7.5105, S: 0.11080 },
    { ageMonths: 6, p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.8, p97: 9.8, L: 0.1257, M: 7.9340, S: 0.10958 },
    { ageMonths: 9, p3: 7.1, p15: 7.9, p50: 8.9, p85: 9.9, p97: 10.9, L: 0.0956, M: 8.9014, S: 0.10862 },
    { ageMonths: 12, p3: 7.7, p15: 8.6, p50: 9.6, p85: 10.8, p97: 12.0, L: 0.0693, M: 9.6479, S: 0.11084 },
    { ageMonths: 15, p3: 8.2, p15: 9.2, p50: 10.3, p85: 11.5, p97: 12.8, L: 0.0424, M: 10.3002, S: 0.11296 },
    { ageMonths: 18, p3: 8.6, p15: 9.7, p50: 10.9, p85: 12.2, p97: 13.7, L: 0.0168, M: 10.8584, S: 0.11564 },
    { ageMonths: 24, p3: 9.7, p15: 10.8, p50: 12.2, p85: 13.6, p97: 15.3, L: -0.0292, M: 12.1515, S: 0.11626 },
    { ageMonths: 30, p3: 10.5, p15: 11.8, p50: 13.3, p85: 15.0, p97: 16.9, L: -0.0683, M: 13.3462, S: 0.11848 },
    { ageMonths: 36, p3: 11.3, p15: 12.7, p50: 14.3, p85: 16.2, p97: 18.3, L: -0.1010, M: 14.3340, S: 0.12246 },
    { ageMonths: 48, p3: 12.7, p15: 14.3, p50: 16.3, p85: 18.6, p97: 21.2, L: -0.1600, M: 16.3289, S: 0.13020 },
    { ageMonths: 60, p3: 14.1, p15: 15.9, p50: 18.3, p85: 21.0, p97: 24.2, L: -0.2100, M: 18.3000, S: 0.13800 },
    { ageMonths: 72, p3: 15.9, p15: 17.8, p50: 20.5, p85: 23.6, p97: 27.1, L: -0.2500, M: 20.5000, S: 0.14100 },
    { ageMonths: 84, p3: 17.4, p15: 19.5, p50: 22.4, p85: 26.0, p97: 30.2, L: -0.2900, M: 22.4000, S: 0.14800 },
    { ageMonths: 96, p3: 18.6, p15: 21.0, p50: 24.5, p85: 28.8, p97: 34.7, L: -0.3200, M: 24.5000, S: 0.15600 },
    { ageMonths: 108, p3: 20.2, p15: 22.8, p50: 26.8, p85: 31.8, p97: 38.6, L: -0.3500, M: 26.8000, S: 0.16400 },
    { ageMonths: 120, p3: 22.0, p15: 24.8, p50: 29.5, p85: 35.2, p97: 44.6, L: -0.3800, M: 29.5000, S: 0.17300 },
    { ageMonths: 132, p3: 24.0, p15: 27.2, p50: 32.5, p85: 39.0, p97: 49.0, L: -0.4000, M: 32.5000, S: 0.18100 },
    { ageMonths: 144, p3: 26.0, p15: 29.8, p50: 36.0, p85: 43.5, p97: 55.0, L: -0.4200, M: 36.0000, S: 0.18900 },
    { ageMonths: 156, p3: 29.0, p15: 33.0, p50: 40.0, p85: 48.0, p97: 60.0, L: -0.4300, M: 40.0000, S: 0.19500 },
    { ageMonths: 168, p3: 33.0, p15: 37.0, p50: 45.0, p85: 54.0, p97: 68.0, L: -0.4400, M: 45.0000, S: 0.20000 },
    { ageMonths: 180, p3: 37.0, p15: 42.0, p50: 50.0, p85: 60.0, p97: 74.0, L: -0.4500, M: 50.0000, S: 0.20200 },
    { ageMonths: 192, p3: 40.0, p15: 46.0, p50: 55.0, p85: 65.0, p97: 80.0, L: -0.4500, M: 55.0000, S: 0.20000 },
    { ageMonths: 204, p3: 44.0, p15: 50.0, p50: 59.0, p85: 69.0, p97: 84.0, L: -0.4400, M: 59.0000, S: 0.19500 },
    { ageMonths: 216, p3: 47.0, p15: 53.0, p50: 62.0, p85: 72.0, p97: 90.0, L: -0.4300, M: 62.0000, S: 0.19000 },
  ],
  female: [
    { ageMonths: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2, L: 0.3809, M: 3.2322, S: 0.14171 },
    { ageMonths: 1, p3: 3.2, p15: 3.6, p50: 4.2, p85: 4.8, p97: 5.5, L: 0.1714, M: 4.1873, S: 0.13724 },
    { ageMonths: 2, p3: 3.9, p15: 4.5, p50: 5.1, p85: 5.8, p97: 6.6, L: 0.0962, M: 5.1282, S: 0.13000 },
    { ageMonths: 3, p3: 4.5, p15: 5.2, p50: 5.8, p85: 6.6, p97: 7.5, L: 0.0402, M: 5.8458, S: 0.12619 },
    { ageMonths: 4, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.3, p97: 8.2, L: -0.0050, M: 6.4237, S: 0.12402 },
    { ageMonths: 5, p3: 5.4, p15: 6.1, p50: 6.9, p85: 7.8, p97: 8.8, L: -0.0430, M: 6.8985, S: 0.12274 },
    { ageMonths: 6, p3: 5.7, p15: 6.5, p50: 7.3, p85: 8.2, p97: 9.3, L: -0.0750, M: 7.2970, S: 0.12204 },
    { ageMonths: 9, p3: 6.5, p15: 7.3, p50: 8.2, p85: 9.3, p97: 10.4, L: -0.1350, M: 8.2000, S: 0.12160 },
    { ageMonths: 12, p3: 7.0, p15: 7.9, p50: 8.9, p85: 10.1, p97: 11.5, L: -0.1780, M: 8.9500, S: 0.12380 },
    { ageMonths: 15, p3: 7.6, p15: 8.5, p50: 9.6, p85: 10.9, p97: 12.4, L: -0.2100, M: 9.6000, S: 0.12620 },
    { ageMonths: 18, p3: 8.1, p15: 9.1, p50: 10.2, p85: 11.6, p97: 13.2, L: -0.2350, M: 10.2000, S: 0.12900 },
    { ageMonths: 24, p3: 9.0, p15: 10.2, p50: 11.5, p85: 13.0, p97: 14.8, L: -0.2780, M: 11.5000, S: 0.12940 },
    { ageMonths: 30, p3: 9.9, p15: 11.1, p50: 12.7, p85: 14.4, p97: 16.5, L: -0.3100, M: 12.7000, S: 0.13200 },
    { ageMonths: 36, p3: 10.8, p15: 12.0, p50: 13.9, p85: 15.9, p97: 18.1, L: -0.3400, M: 13.9000, S: 0.13500 },
    { ageMonths: 48, p3: 12.3, p15: 13.9, p50: 16.1, p85: 18.5, p97: 21.5, L: -0.3800, M: 16.1000, S: 0.14100 },
    { ageMonths: 60, p3: 13.7, p15: 15.8, p50: 18.2, p85: 21.2, p97: 24.9, L: -0.4100, M: 18.2000, S: 0.14800 },
    { ageMonths: 72, p3: 15.3, p15: 17.5, p50: 20.2, p85: 23.5, p97: 27.8, L: -0.4300, M: 20.2000, S: 0.15200 },
    { ageMonths: 84, p3: 16.8, p15: 19.2, p50: 22.2, p85: 26.0, p97: 31.0, L: -0.4500, M: 22.2000, S: 0.15800 },
    { ageMonths: 96, p3: 17.7, p15: 20.4, p50: 24.2, p85: 28.8, p97: 34.8, L: -0.4700, M: 24.2000, S: 0.16500 },
    { ageMonths: 108, p3: 19.5, p15: 22.5, p50: 26.7, p85: 32.0, p97: 39.0, L: -0.4900, M: 26.7000, S: 0.17300 },
    { ageMonths: 120, p3: 21.0, p15: 24.5, p50: 29.5, p85: 35.5, p97: 45.0, L: -0.5000, M: 29.5000, S: 0.18100 },
    { ageMonths: 132, p3: 23.5, p15: 27.0, p50: 33.0, p85: 40.0, p97: 50.0, L: -0.5100, M: 33.0000, S: 0.18800 },
    { ageMonths: 144, p3: 25.0, p15: 29.5, p50: 36.5, p85: 44.5, p97: 56.0, L: -0.5100, M: 36.5000, S: 0.19500 },
    { ageMonths: 156, p3: 28.0, p15: 32.5, p50: 40.0, p85: 49.0, p97: 60.0, L: -0.5000, M: 40.0000, S: 0.19800 },
    { ageMonths: 168, p3: 32.0, p15: 36.5, p50: 44.0, p85: 53.0, p97: 65.0, L: -0.4800, M: 44.0000, S: 0.19500 },
    { ageMonths: 180, p3: 35.0, p15: 39.5, p50: 47.0, p85: 56.0, p97: 68.0, L: -0.4600, M: 47.0000, S: 0.19000 },
    { ageMonths: 192, p3: 38.0, p15: 42.0, p50: 50.0, p85: 58.0, p97: 72.0, L: -0.4400, M: 50.0000, S: 0.18500 },
    { ageMonths: 204, p3: 40.0, p15: 44.0, p50: 52.0, p85: 60.0, p97: 73.0, L: -0.4200, M: 52.0000, S: 0.18000 },
    { ageMonths: 216, p3: 42.0, p15: 46.0, p50: 54.0, p85: 62.0, p97: 75.0, L: -0.4000, M: 54.0000, S: 0.17500 },
  ],
};

// === HEIGHT/LENGTH (cm) by age in months ===
export const heightReference: GrowthReferenceSet = {
  male: [
    { ageMonths: 0, p3: 46.1, p15: 47.9, p50: 49.9, p85: 51.8, p97: 53.7, L: 1, M: 49.8842, S: 0.03795 },
    { ageMonths: 1, p3: 50.8, p15: 52.3, p50: 54.7, p85: 56.7, p97: 58.6, L: 1, M: 54.7244, S: 0.03557 },
    { ageMonths: 2, p3: 54.4, p15: 56.0, p50: 58.4, p85: 60.6, p97: 62.4, L: 1, M: 58.4249, S: 0.03424 },
    { ageMonths: 3, p3: 57.3, p15: 59.0, p50: 61.4, p85: 63.5, p97: 65.5, L: 1, M: 61.4292, S: 0.03328 },
    { ageMonths: 4, p3: 59.7, p15: 61.4, p50: 63.9, p85: 66.0, p97: 68.0, L: 1, M: 63.8860, S: 0.03257 },
    { ageMonths: 5, p3: 61.7, p15: 63.4, p50: 65.9, p85: 68.0, p97: 70.1, L: 1, M: 65.9026, S: 0.03204 },
    { ageMonths: 6, p3: 63.3, p15: 65.1, p50: 67.6, p85: 69.8, p97: 71.9, L: 1, M: 67.6236, S: 0.03169 },
    { ageMonths: 9, p3: 67.5, p15: 69.4, p50: 72.0, p85: 74.2, p97: 76.5, L: 1, M: 72.0000, S: 0.03100 },
    { ageMonths: 12, p3: 71.0, p15: 72.8, p50: 75.7, p85: 78.1, p97: 80.5, L: 1, M: 75.7488, S: 0.03050 },
    { ageMonths: 15, p3: 73.6, p15: 76.0, p50: 79.1, p85: 81.7, p97: 84.2, L: 1, M: 79.1000, S: 0.03020 },
    { ageMonths: 18, p3: 76.9, p15: 78.9, p50: 82.3, p85: 84.9, p97: 87.7, L: 1, M: 82.3000, S: 0.03000 },
    { ageMonths: 24, p3: 81.7, p15: 84.1, p50: 87.8, p85: 90.9, p97: 93.9, L: 1, M: 87.8000, S: 0.03000 },
    { ageMonths: 30, p3: 85.6, p15: 88.2, p50: 92.0, p85: 95.2, p97: 98.7, L: 1, M: 92.0000, S: 0.03000 },
    { ageMonths: 36, p3: 88.7, p15: 91.5, p50: 96.1, p85: 99.8, p97: 103.5, L: 1, M: 96.1000, S: 0.03000 },
    { ageMonths: 48, p3: 94.9, p15: 98.1, p50: 103.3, p85: 107.5, p97: 111.7, L: 1, M: 103.3000, S: 0.03100 },
    { ageMonths: 60, p3: 100.7, p15: 104.2, p50: 110.0, p85: 114.6, p97: 119.2, L: 1, M: 110.0000, S: 0.03200 },
    { ageMonths: 72, p3: 106.1, p15: 109.9, p50: 116.0, p85: 120.8, p97: 125.8, L: 1, M: 116.0000, S: 0.03300 },
    { ageMonths: 84, p3: 111.2, p15: 115.0, p50: 121.7, p85: 126.5, p97: 131.3, L: 1, M: 121.7000, S: 0.03300 },
    { ageMonths: 96, p3: 116.0, p15: 120.0, p50: 127.0, p85: 132.0, p97: 138.0, L: 1, M: 127.0000, S: 0.03400 },
    { ageMonths: 108, p3: 120.5, p15: 124.5, p50: 132.0, p85: 137.5, p97: 143.5, L: 1, M: 132.0000, S: 0.03400 },
    { ageMonths: 120, p3: 125.0, p15: 129.5, p50: 137.0, p85: 143.0, p97: 150.0, L: 1, M: 137.0000, S: 0.03500 },
    { ageMonths: 132, p3: 129.0, p15: 134.0, p50: 142.0, p85: 149.0, p97: 156.0, L: 1, M: 142.0000, S: 0.03600 },
    { ageMonths: 144, p3: 134.0, p15: 139.0, p50: 148.0, p85: 155.0, p97: 163.0, L: 1, M: 148.0000, S: 0.03700 },
    { ageMonths: 156, p3: 139.0, p15: 144.5, p50: 155.0, p85: 162.0, p97: 170.0, L: 1, M: 155.0000, S: 0.03900 },
    { ageMonths: 168, p3: 145.0, p15: 151.0, p50: 161.0, p85: 169.0, p97: 176.0, L: 1, M: 161.0000, S: 0.03800 },
    { ageMonths: 180, p3: 150.0, p15: 156.0, p50: 166.0, p85: 174.0, p97: 181.0, L: 1, M: 166.0000, S: 0.03700 },
    { ageMonths: 192, p3: 155.0, p15: 161.0, p50: 170.0, p85: 178.0, p97: 185.0, L: 1, M: 170.0000, S: 0.03500 },
    { ageMonths: 204, p3: 158.0, p15: 164.0, p50: 173.0, p85: 180.0, p97: 187.0, L: 1, M: 173.0000, S: 0.03300 },
    { ageMonths: 216, p3: 160.0, p15: 165.5, p50: 175.0, p85: 182.0, p97: 190.0, L: 1, M: 175.0000, S: 0.03200 },
  ],
  female: [
    { ageMonths: 0, p3: 45.4, p15: 47.0, p50: 49.1, p85: 51.0, p97: 52.9, L: 1, M: 49.1477, S: 0.03790 },
    { ageMonths: 1, p3: 49.8, p15: 51.2, p50: 53.7, p85: 55.6, p97: 57.6, L: 1, M: 53.6872, S: 0.03614 },
    { ageMonths: 2, p3: 53.0, p15: 54.6, p50: 57.1, p85: 59.2, p97: 61.1, L: 1, M: 57.0673, S: 0.03568 },
    { ageMonths: 3, p3: 55.6, p15: 57.2, p50: 59.8, p85: 62.0, p97: 64.0, L: 1, M: 59.8029, S: 0.03524 },
    { ageMonths: 4, p3: 57.8, p15: 59.5, p50: 62.1, p85: 64.3, p97: 66.4, L: 1, M: 62.0899, S: 0.03486 },
    { ageMonths: 5, p3: 59.6, p15: 61.4, p50: 64.0, p85: 66.2, p97: 68.5, L: 1, M: 64.0301, S: 0.03463 },
    { ageMonths: 6, p3: 61.2, p15: 63.0, p50: 65.7, p85: 68.0, p97: 70.3, L: 1, M: 65.7311, S: 0.03448 },
    { ageMonths: 9, p3: 65.3, p15: 67.2, p50: 70.1, p85: 72.6, p97: 75.0, L: 1, M: 70.1000, S: 0.03400 },
    { ageMonths: 12, p3: 68.9, p15: 71.0, p50: 74.0, p85: 76.8, p97: 79.2, L: 1, M: 74.0000, S: 0.03380 },
    { ageMonths: 15, p3: 72.0, p15: 74.0, p50: 77.5, p85: 80.2, p97: 83.0, L: 1, M: 77.5000, S: 0.03350 },
    { ageMonths: 18, p3: 74.9, p15: 77.2, p50: 80.7, p85: 83.6, p97: 86.5, L: 1, M: 80.7000, S: 0.03350 },
    { ageMonths: 24, p3: 80.0, p15: 82.5, p50: 86.4, p85: 89.6, p97: 92.9, L: 1, M: 86.4000, S: 0.03350 },
    { ageMonths: 30, p3: 84.0, p15: 86.6, p50: 91.1, p85: 94.4, p97: 98.1, L: 1, M: 91.1000, S: 0.03400 },
    { ageMonths: 36, p3: 87.4, p15: 90.3, p50: 95.1, p85: 98.9, p97: 102.7, L: 1, M: 95.1000, S: 0.03400 },
    { ageMonths: 48, p3: 93.9, p15: 97.2, p50: 102.7, p85: 107.2, p97: 111.3, L: 1, M: 102.7000, S: 0.03400 },
    { ageMonths: 60, p3: 99.9, p15: 103.6, p50: 109.4, p85: 114.2, p97: 118.9, L: 1, M: 109.4000, S: 0.03400 },
    { ageMonths: 72, p3: 105.0, p15: 109.0, p50: 115.5, p85: 120.5, p97: 125.4, L: 1, M: 115.5000, S: 0.03500 },
    { ageMonths: 84, p3: 110.0, p15: 114.5, p50: 121.0, p85: 126.5, p97: 131.5, L: 1, M: 121.0000, S: 0.03500 },
    { ageMonths: 96, p3: 115.0, p15: 119.5, p50: 126.5, p85: 132.0, p97: 138.0, L: 1, M: 126.5000, S: 0.03600 },
    { ageMonths: 108, p3: 120.0, p15: 124.5, p50: 132.0, p85: 138.0, p97: 144.0, L: 1, M: 132.0000, S: 0.03600 },
    { ageMonths: 120, p3: 124.0, p15: 129.0, p50: 137.5, p85: 144.0, p97: 151.0, L: 1, M: 137.5000, S: 0.03700 },
    { ageMonths: 132, p3: 129.0, p15: 134.0, p50: 143.0, p85: 150.0, p97: 157.0, L: 1, M: 143.0000, S: 0.03800 },
    { ageMonths: 144, p3: 133.0, p15: 139.0, p50: 149.0, p85: 156.0, p97: 162.0, L: 1, M: 149.0000, S: 0.03800 },
    { ageMonths: 156, p3: 138.0, p15: 144.0, p50: 153.0, p85: 160.0, p97: 166.0, L: 1, M: 153.0000, S: 0.03600 },
    { ageMonths: 168, p3: 145.0, p15: 149.0, p50: 157.0, p85: 163.0, p97: 169.0, L: 1, M: 157.0000, S: 0.03400 },
    { ageMonths: 180, p3: 148.0, p15: 152.0, p50: 159.5, p85: 165.0, p97: 171.0, L: 1, M: 159.5000, S: 0.03200 },
    { ageMonths: 192, p3: 150.0, p15: 154.0, p50: 161.0, p85: 167.0, p97: 172.0, L: 1, M: 161.0000, S: 0.03000 },
    { ageMonths: 204, p3: 151.0, p15: 155.0, p50: 162.0, p85: 168.0, p97: 173.0, L: 1, M: 162.0000, S: 0.02800 },
    { ageMonths: 216, p3: 152.0, p15: 156.0, p50: 163.0, p85: 169.0, p97: 174.0, L: 1, M: 163.0000, S: 0.02700 },
  ],
};

// === BMI (kg/m²) by age in months (2-19 years) ===
export const bmiReference: GrowthReferenceSet = {
  male: [
    { ageMonths: 24, p3: 13.4, p15: 14.2, p50: 15.7, p85: 17.0, p97: 18.4, L: -0.54, M: 15.7, S: 0.0806 },
    { ageMonths: 36, p3: 13.1, p15: 13.9, p50: 15.3, p85: 16.6, p97: 17.9, L: -0.98, M: 15.3, S: 0.0762 },
    { ageMonths: 48, p3: 12.9, p15: 13.7, p50: 15.2, p85: 16.6, p97: 18.0, L: -1.18, M: 15.2, S: 0.0780 },
    { ageMonths: 60, p3: 12.8, p15: 13.6, p50: 15.1, p85: 16.6, p97: 18.3, L: -1.42, M: 15.1, S: 0.0830 },
    { ageMonths: 72, p3: 12.8, p15: 13.6, p50: 15.2, p85: 16.9, p97: 18.8, L: -1.62, M: 15.2, S: 0.0890 },
    { ageMonths: 84, p3: 12.9, p15: 13.7, p50: 15.4, p85: 17.2, p97: 19.4, L: -1.80, M: 15.4, S: 0.0960 },
    { ageMonths: 96, p3: 13.1, p15: 13.9, p50: 15.7, p85: 17.8, p97: 20.3, L: -1.95, M: 15.7, S: 0.1040 },
    { ageMonths: 108, p3: 13.3, p15: 14.2, p50: 16.1, p85: 18.4, p97: 21.3, L: -2.06, M: 16.1, S: 0.1110 },
    { ageMonths: 120, p3: 13.6, p15: 14.6, p50: 16.6, p85: 19.2, p97: 22.5, L: -2.14, M: 16.6, S: 0.1180 },
    { ageMonths: 132, p3: 14.0, p15: 15.0, p50: 17.2, p85: 20.0, p97: 23.6, L: -2.18, M: 17.2, S: 0.1240 },
    { ageMonths: 144, p3: 14.5, p15: 15.5, p50: 17.8, p85: 20.9, p97: 24.8, L: -2.20, M: 17.8, S: 0.1290 },
    { ageMonths: 156, p3: 15.0, p15: 16.1, p50: 18.5, p85: 21.8, p97: 25.9, L: -2.20, M: 18.5, S: 0.1330 },
    { ageMonths: 168, p3: 15.5, p15: 16.7, p50: 19.2, p85: 22.6, p97: 26.8, L: -2.18, M: 19.2, S: 0.1350 },
    { ageMonths: 180, p3: 16.1, p15: 17.3, p50: 19.9, p85: 23.3, p97: 27.6, L: -2.14, M: 19.9, S: 0.1360 },
    { ageMonths: 192, p3: 16.6, p15: 17.9, p50: 20.5, p85: 24.0, p97: 28.2, L: -2.08, M: 20.5, S: 0.1360 },
    { ageMonths: 204, p3: 17.1, p15: 18.4, p50: 21.1, p85: 24.5, p97: 28.7, L: -2.02, M: 21.1, S: 0.1350 },
    { ageMonths: 216, p3: 17.5, p15: 18.8, p50: 21.7, p85: 25.0, p97: 29.1, L: -1.96, M: 21.7, S: 0.1330 },
  ],
  female: [
    { ageMonths: 24, p3: 13.2, p15: 14.0, p50: 15.4, p85: 16.8, p97: 18.2, L: -0.42, M: 15.4, S: 0.0818 },
    { ageMonths: 36, p3: 12.8, p15: 13.6, p50: 15.0, p85: 16.5, p97: 17.9, L: -0.76, M: 15.0, S: 0.0824 },
    { ageMonths: 48, p3: 12.7, p15: 13.4, p50: 14.9, p85: 16.5, p97: 18.2, L: -0.98, M: 14.9, S: 0.0862 },
    { ageMonths: 60, p3: 12.6, p15: 13.4, p50: 14.9, p85: 16.7, p97: 18.6, L: -1.20, M: 14.9, S: 0.0920 },
    { ageMonths: 72, p3: 12.6, p15: 13.4, p50: 15.1, p85: 17.0, p97: 19.2, L: -1.40, M: 15.1, S: 0.0990 },
    { ageMonths: 84, p3: 12.7, p15: 13.5, p50: 15.3, p85: 17.5, p97: 20.1, L: -1.58, M: 15.3, S: 0.1060 },
    { ageMonths: 96, p3: 12.9, p15: 13.8, p50: 15.7, p85: 18.2, p97: 21.1, L: -1.72, M: 15.7, S: 0.1130 },
    { ageMonths: 108, p3: 13.2, p15: 14.2, p50: 16.2, p85: 19.0, p97: 22.3, L: -1.84, M: 16.2, S: 0.1200 },
    { ageMonths: 120, p3: 13.5, p15: 14.6, p50: 16.8, p85: 19.8, p97: 23.5, L: -1.92, M: 16.8, S: 0.1270 },
    { ageMonths: 132, p3: 14.0, p15: 15.1, p50: 17.5, p85: 20.7, p97: 24.6, L: -1.98, M: 17.5, S: 0.1330 },
    { ageMonths: 144, p3: 14.5, p15: 15.7, p50: 18.2, p85: 21.5, p97: 25.6, L: -2.00, M: 18.2, S: 0.1380 },
    { ageMonths: 156, p3: 15.1, p15: 16.3, p50: 19.0, p85: 22.3, p97: 26.4, L: -1.98, M: 19.0, S: 0.1410 },
    { ageMonths: 168, p3: 15.6, p15: 16.9, p50: 19.6, p85: 23.0, p97: 27.1, L: -1.94, M: 19.6, S: 0.1420 },
    { ageMonths: 180, p3: 16.1, p15: 17.4, p50: 20.2, p85: 23.6, p97: 27.6, L: -1.88, M: 20.2, S: 0.1420 },
    { ageMonths: 192, p3: 16.4, p15: 17.8, p50: 20.7, p85: 24.0, p97: 28.0, L: -1.82, M: 20.7, S: 0.1400 },
    { ageMonths: 204, p3: 16.7, p15: 18.1, p50: 21.0, p85: 24.3, p97: 28.2, L: -1.76, M: 21.0, S: 0.1380 },
    { ageMonths: 216, p3: 16.9, p15: 18.3, p50: 21.3, p85: 24.5, p97: 28.4, L: -1.70, M: 21.3, S: 0.1360 },
  ],
};

// === HEAD CIRCUMFERENCE (cm) by age in months (0-36 months) ===
export const headCircumferenceReference: GrowthReferenceSet = {
  male: [
    { ageMonths: 0, p3: 31.9, p15: 33.0, p50: 34.5, p85: 35.8, p97: 37.0, L: 1, M: 34.46, S: 0.0369 },
    { ageMonths: 1, p3: 34.9, p15: 35.9, p50: 37.3, p85: 38.5, p97: 39.6, L: 1, M: 37.28, S: 0.0316 },
    { ageMonths: 2, p3: 36.8, p15: 37.8, p50: 39.1, p85: 40.3, p97: 41.5, L: 1, M: 39.13, S: 0.0294 },
    { ageMonths: 3, p3: 38.1, p15: 39.1, p50: 40.5, p85: 41.7, p97: 42.9, L: 1, M: 40.51, S: 0.0281 },
    { ageMonths: 4, p3: 39.2, p15: 40.1, p50: 41.6, p85: 42.8, p97: 44.0, L: 1, M: 41.63, S: 0.0274 },
    { ageMonths: 5, p3: 40.1, p15: 41.0, p50: 42.6, p85: 43.7, p97: 44.9, L: 1, M: 42.56, S: 0.0270 },
    { ageMonths: 6, p3: 40.9, p15: 41.8, p50: 43.3, p85: 44.6, p97: 45.8, L: 1, M: 43.34, S: 0.0267 },
    { ageMonths: 9, p3: 42.4, p15: 43.3, p50: 44.8, p85: 46.1, p97: 47.4, L: 1, M: 44.77, S: 0.0264 },
    { ageMonths: 12, p3: 43.5, p15: 44.4, p50: 46.1, p85: 47.4, p97: 48.6, L: 1, M: 46.09, S: 0.0262 },
    { ageMonths: 15, p3: 44.2, p15: 45.2, p50: 46.8, p85: 48.2, p97: 49.4, L: 1, M: 46.84, S: 0.0261 },
    { ageMonths: 18, p3: 44.7, p15: 45.7, p50: 47.4, p85: 48.8, p97: 50.0, L: 1, M: 47.37, S: 0.0261 },
    { ageMonths: 24, p3: 45.5, p15: 46.5, p50: 48.3, p85: 49.7, p97: 50.9, L: 1, M: 48.25, S: 0.0262 },
    { ageMonths: 30, p3: 46.1, p15: 47.1, p50: 48.9, p85: 50.3, p97: 51.5, L: 1, M: 48.89, S: 0.0262 },
    { ageMonths: 36, p3: 46.6, p15: 47.5, p50: 49.3, p85: 50.7, p97: 51.9, L: 1, M: 49.33, S: 0.0262 },
  ],
  female: [
    { ageMonths: 0, p3: 31.5, p15: 32.4, p50: 33.9, p85: 35.1, p97: 36.2, L: 1, M: 33.89, S: 0.0356 },
    { ageMonths: 1, p3: 34.2, p15: 35.1, p50: 36.5, p85: 37.7, p97: 38.9, L: 1, M: 36.55, S: 0.0316 },
    { ageMonths: 2, p3: 35.8, p15: 36.8, p50: 38.3, p85: 39.5, p97: 40.7, L: 1, M: 38.27, S: 0.0299 },
    { ageMonths: 3, p3: 37.1, p15: 38.0, p50: 39.5, p85: 40.8, p97: 42.0, L: 1, M: 39.53, S: 0.0289 },
    { ageMonths: 4, p3: 38.0, p15: 39.0, p50: 40.6, p85: 41.8, p97: 43.0, L: 1, M: 40.58, S: 0.0284 },
    { ageMonths: 5, p3: 38.9, p15: 39.8, p50: 41.5, p85: 42.7, p97: 43.9, L: 1, M: 41.45, S: 0.0280 },
    { ageMonths: 6, p3: 39.6, p15: 40.5, p50: 42.2, p85: 43.4, p97: 44.6, L: 1, M: 42.15, S: 0.0278 },
    { ageMonths: 9, p3: 41.0, p15: 41.9, p50: 43.5, p85: 44.8, p97: 46.1, L: 1, M: 43.51, S: 0.0276 },
    { ageMonths: 12, p3: 42.0, p15: 42.9, p50: 44.5, p85: 45.9, p97: 47.2, L: 1, M: 44.54, S: 0.0276 },
    { ageMonths: 15, p3: 42.7, p15: 43.6, p50: 45.4, p85: 46.8, p97: 48.0, L: 1, M: 45.38, S: 0.0276 },
    { ageMonths: 18, p3: 43.2, p15: 44.1, p50: 45.9, p85: 47.4, p97: 48.6, L: 1, M: 45.93, S: 0.0276 },
    { ageMonths: 24, p3: 44.0, p15: 44.9, p50: 46.9, p85: 48.3, p97: 49.6, L: 1, M: 46.87, S: 0.0277 },
    { ageMonths: 30, p3: 44.6, p15: 45.5, p50: 47.5, p85: 48.9, p97: 50.2, L: 1, M: 47.47, S: 0.0277 },
    { ageMonths: 36, p3: 45.0, p15: 45.9, p50: 47.9, p85: 49.3, p97: 50.6, L: 1, M: 47.92, S: 0.0278 },
  ],
};

/**
 * Calculate Z-score using LMS method (Box-Cox transformation).
 * z = ((value/M)^L - 1) / (L * S) when L ≠ 0
 * z = ln(value/M) / S when L = 0
 */
export function calculateZScore(value: number, ref: GrowthReferencePoint): number | null {
  if (!ref.L || !ref.M || !ref.S || ref.M === 0 || ref.S === 0) return null;
  
  const { L, M, S } = ref;
  
  if (Math.abs(L) < 0.001) {
    // L ≈ 0, use log formula
    return Math.log(value / M) / S;
  }
  
  return (Math.pow(value / M, L) - 1) / (L * S);
}

/**
 * Convert Z-score to approximate percentile using normal distribution.
 */
export function zScoreToPercentile(z: number): number {
  // Approximation of the cumulative normal distribution
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return Math.round((0.5 * (1.0 + sign * y)) * 1000) / 10;
}

/**
 * Interpolate reference values for a given age in months.
 * Uses linear interpolation between the two closest reference points.
 */
export function interpolateReference(
  ageMonths: number,
  data: GrowthReferencePoint[]
): GrowthReferencePoint | null {
  if (data.length === 0) return null;

  if (ageMonths <= data[0].ageMonths) return data[0];
  if (ageMonths >= data[data.length - 1].ageMonths) return data[data.length - 1];

  for (let i = 0; i < data.length - 1; i++) {
    const a = data[i];
    const b = data[i + 1];
    if (ageMonths >= a.ageMonths && ageMonths <= b.ageMonths) {
      const t = (ageMonths - a.ageMonths) / (b.ageMonths - a.ageMonths);
      return {
        ageMonths,
        p3: round(a.p3 + t * (b.p3 - a.p3)),
        p15: round(a.p15 + t * (b.p15 - a.p15)),
        p50: round(a.p50 + t * (b.p50 - a.p50)),
        p85: round(a.p85 + t * (b.p85 - a.p85)),
        p97: round(a.p97 + t * (b.p97 - a.p97)),
        L: a.L != null && b.L != null ? a.L + t * (b.L - a.L) : undefined,
        M: a.M != null && b.M != null ? round(a.M + t * (b.M - a.M)) : undefined,
        S: a.S != null && b.S != null ? a.S + t * (b.S - a.S) : undefined,
      };
    }
  }
  return null;
}

function round(v: number): number {
  return Math.round(v * 10) / 10;
}

/**
 * Build a full reference curve array for chart display.
 */
export function buildReferenceCurve(
  refData: GrowthReferencePoint[],
  minAge: number,
  maxAge: number,
  stepMonths = 1
): GrowthReferencePoint[] {
  const curve: GrowthReferencePoint[] = [];
  for (let m = minAge; m <= maxAge; m += stepMonths) {
    const point = interpolateReference(m, refData);
    if (point) curve.push(point);
  }
  return curve;
}

/**
 * Estimate which percentile a value falls into.
 */
export function estimatePercentile(
  value: number,
  ref: GrowthReferencePoint
): { percentile: string; zone: "critical-low" | "low" | "normal" | "high" | "critical-high"; zScore: number | null; exactPercentile: number | null } {
  const zScore = calculateZScore(value, ref);
  const exactPercentile = zScore != null ? zScoreToPercentile(zScore) : null;
  
  if (value < ref.p3) return { percentile: "< P3", zone: "critical-low", zScore, exactPercentile };
  if (value < ref.p15) return { percentile: "P3-P15", zone: "low", zScore, exactPercentile };
  if (value <= ref.p85) return { percentile: "P15-P85", zone: "normal", zScore, exactPercentile };
  if (value <= ref.p97) return { percentile: "P85-P97", zone: "high", zScore, exactPercentile };
  return { percentile: "> P97", zone: "critical-high", zScore, exactPercentile };
}

/**
 * Detect growth alerts by comparing sequential measurements.
 */
export function detectGrowthAlerts(
  growthHistory: { ageMonths: number; weight?: number | null; height?: number | null }[],
  refData: GrowthReferenceSet,
  genderKey: "male" | "female"
): string[] {
  const alerts: string[] = [];
  if (growthHistory.length < 2) return alerts;

  const sorted = [...growthHistory].sort((a, b) => a.ageMonths - b.ageMonths);

  // Check percentile crossing for weight
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    if (prev.weight && curr.weight) {
      const prevRef = interpolateReference(prev.ageMonths, refData.weight ?? weightReference[genderKey]);
      const currRef = interpolateReference(curr.ageMonths, refData.weight ?? weightReference[genderKey]);
      if (prevRef && currRef) {
        const prevEst = estimatePercentile(prev.weight, prevRef);
        const currEst = estimatePercentile(curr.weight, currRef);
        
        // Percentile crossing detection
        const zones = ["critical-low", "low", "normal", "high", "critical-high"];
        const prevIdx = zones.indexOf(prevEst.zone);
        const currIdx = zones.indexOf(currEst.zone);
        
        if (Math.abs(currIdx - prevIdx) >= 2) {
          if (currIdx > prevIdx) {
            alerts.push(`Cruzamento de percentil de peso: ganho acelerado entre ${prev.ageMonths}m e ${curr.ageMonths}m`);
          } else {
            alerts.push(`Cruzamento de percentil de peso: desaceleração entre ${prev.ageMonths}m e ${curr.ageMonths}m`);
          }
        }
      }
    }

    // Growth deceleration for height
    if (prev.height && curr.height) {
      const monthsDiff = curr.ageMonths - prev.ageMonths;
      if (monthsDiff > 0) {
        const growthRate = (curr.height - prev.height) / monthsDiff; // cm/month
        if (curr.ageMonths <= 12 && growthRate < 0.8) {
          alerts.push(`Velocidade de crescimento reduzida: ${(growthRate * 12).toFixed(1)} cm/ano entre ${prev.ageMonths}m e ${curr.ageMonths}m`);
        } else if (curr.ageMonths > 12 && curr.ageMonths <= 36 && growthRate < 0.5) {
          alerts.push(`Velocidade de crescimento reduzida: ${(growthRate * 12).toFixed(1)} cm/ano entre ${prev.ageMonths}m e ${curr.ageMonths}m`);
        }
      }
    }
  }

  // Check latest value positions
  const latest = sorted[sorted.length - 1];
  if (latest.weight) {
    const ref = interpolateReference(latest.ageMonths, weightReference[genderKey]);
    if (ref) {
      const est = estimatePercentile(latest.weight, ref);
      if (est.zone === "critical-low") alerts.push("Peso atual abaixo do percentil 3 — investigar desnutrição ou patologia");
      if (est.zone === "critical-high") alerts.push("Peso atual acima do percentil 97 — avaliar obesidade infantil");
    }
  }
  if (latest.height) {
    const ref = interpolateReference(latest.ageMonths, heightReference[genderKey]);
    if (ref) {
      const est = estimatePercentile(latest.height, ref);
      if (est.zone === "critical-low") alerts.push("Estatura abaixo do percentil 3 — investigar baixa estatura patológica");
    }
  }

  return alerts;
}
