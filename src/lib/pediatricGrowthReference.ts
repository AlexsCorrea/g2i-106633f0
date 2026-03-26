// WHO Child Growth Standards - Simplified reference data
// Based on WHO Multicentre Growth Reference Study (0-5y) and WHO Reference 2007 (5-19y)
// Values represent P3, P15, P50 (median), P85, P97 percentiles

export interface GrowthReferencePoint {
  ageMonths: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

export interface GrowthReferenceSet {
  male: GrowthReferencePoint[];
  female: GrowthReferencePoint[];
}

// === WEIGHT (kg) by age in months ===
export const weightReference: GrowthReferenceSet = {
  male: [
    { ageMonths: 0, p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.4 },
    { ageMonths: 1, p3: 3.4, p15: 3.9, p50: 4.5, p85: 5.1, p97: 5.8 },
    { ageMonths: 2, p3: 4.3, p15: 4.9, p50: 5.6, p85: 6.3, p97: 7.1 },
    { ageMonths: 3, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.2, p97: 8.0 },
    { ageMonths: 4, p3: 5.6, p15: 6.2, p50: 7.0, p85: 7.8, p97: 8.7 },
    { ageMonths: 5, p3: 6.0, p15: 6.7, p50: 7.5, p85: 8.4, p97: 9.3 },
    { ageMonths: 6, p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.8, p97: 9.8 },
    { ageMonths: 9, p3: 7.1, p15: 7.9, p50: 8.9, p85: 9.9, p97: 10.9 },
    { ageMonths: 12, p3: 7.7, p15: 8.6, p50: 9.6, p85: 10.8, p97: 12.0 },
    { ageMonths: 15, p3: 8.2, p15: 9.2, p50: 10.3, p85: 11.5, p97: 12.8 },
    { ageMonths: 18, p3: 8.6, p15: 9.7, p50: 10.9, p85: 12.2, p97: 13.7 },
    { ageMonths: 24, p3: 9.7, p15: 10.8, p50: 12.2, p85: 13.6, p97: 15.3 },
    { ageMonths: 30, p3: 10.5, p15: 11.8, p50: 13.3, p85: 15.0, p97: 16.9 },
    { ageMonths: 36, p3: 11.3, p15: 12.7, p50: 14.3, p85: 16.2, p97: 18.3 },
    { ageMonths: 48, p3: 12.7, p15: 14.3, p50: 16.3, p85: 18.6, p97: 21.2 },
    { ageMonths: 60, p3: 14.1, p15: 15.9, p50: 18.3, p85: 21.0, p97: 24.2 },
    { ageMonths: 72, p3: 15.9, p15: 17.8, p50: 20.5, p85: 23.6, p97: 27.1 },
    { ageMonths: 84, p3: 17.4, p15: 19.5, p50: 22.4, p85: 26.0, p97: 30.2 },
    { ageMonths: 96, p3: 18.6, p15: 21.0, p50: 24.5, p85: 28.8, p97: 34.7 },
    { ageMonths: 108, p3: 20.2, p15: 22.8, p50: 26.8, p85: 31.8, p97: 38.6 },
    { ageMonths: 120, p3: 22.0, p15: 24.8, p50: 29.5, p85: 35.2, p97: 44.6 },
    { ageMonths: 132, p3: 24.0, p15: 27.2, p50: 32.5, p85: 39.0, p97: 49.0 },
    { ageMonths: 144, p3: 26.0, p15: 29.8, p50: 36.0, p85: 43.5, p97: 55.0 },
    { ageMonths: 156, p3: 29.0, p15: 33.0, p50: 40.0, p85: 48.0, p97: 60.0 },
    { ageMonths: 168, p3: 33.0, p15: 37.0, p50: 45.0, p85: 54.0, p97: 68.0 },
    { ageMonths: 180, p3: 37.0, p15: 42.0, p50: 50.0, p85: 60.0, p97: 74.0 },
    { ageMonths: 192, p3: 40.0, p15: 46.0, p50: 55.0, p85: 65.0, p97: 80.0 },
    { ageMonths: 204, p3: 44.0, p15: 50.0, p50: 59.0, p85: 69.0, p97: 84.0 },
    { ageMonths: 216, p3: 47.0, p15: 53.0, p50: 62.0, p85: 72.0, p97: 90.0 },
  ],
  female: [
    { ageMonths: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
    { ageMonths: 1, p3: 3.2, p15: 3.6, p50: 4.2, p85: 4.8, p97: 5.5 },
    { ageMonths: 2, p3: 3.9, p15: 4.5, p50: 5.1, p85: 5.8, p97: 6.6 },
    { ageMonths: 3, p3: 4.5, p15: 5.2, p50: 5.8, p85: 6.6, p97: 7.5 },
    { ageMonths: 4, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.3, p97: 8.2 },
    { ageMonths: 5, p3: 5.4, p15: 6.1, p50: 6.9, p85: 7.8, p97: 8.8 },
    { ageMonths: 6, p3: 5.7, p15: 6.5, p50: 7.3, p85: 8.2, p97: 9.3 },
    { ageMonths: 9, p3: 6.5, p15: 7.3, p50: 8.2, p85: 9.3, p97: 10.4 },
    { ageMonths: 12, p3: 7.0, p15: 7.9, p50: 8.9, p85: 10.1, p97: 11.5 },
    { ageMonths: 15, p3: 7.6, p15: 8.5, p50: 9.6, p85: 10.9, p97: 12.4 },
    { ageMonths: 18, p3: 8.1, p15: 9.1, p50: 10.2, p85: 11.6, p97: 13.2 },
    { ageMonths: 24, p3: 9.0, p15: 10.2, p50: 11.5, p85: 13.0, p97: 14.8 },
    { ageMonths: 30, p3: 9.9, p15: 11.1, p50: 12.7, p85: 14.4, p97: 16.5 },
    { ageMonths: 36, p3: 10.8, p15: 12.0, p50: 13.9, p85: 15.9, p97: 18.1 },
    { ageMonths: 48, p3: 12.3, p15: 13.9, p50: 16.1, p85: 18.5, p97: 21.5 },
    { ageMonths: 60, p3: 13.7, p15: 15.8, p50: 18.2, p85: 21.2, p97: 24.9 },
    { ageMonths: 72, p3: 15.3, p15: 17.5, p50: 20.2, p85: 23.5, p97: 27.8 },
    { ageMonths: 84, p3: 16.8, p15: 19.2, p50: 22.2, p85: 26.0, p97: 31.0 },
    { ageMonths: 96, p3: 17.7, p15: 20.4, p50: 24.2, p85: 28.8, p97: 34.8 },
    { ageMonths: 108, p3: 19.5, p15: 22.5, p50: 26.7, p85: 32.0, p97: 39.0 },
    { ageMonths: 120, p3: 21.0, p15: 24.5, p50: 29.5, p85: 35.5, p97: 45.0 },
    { ageMonths: 132, p3: 23.5, p15: 27.0, p50: 33.0, p85: 40.0, p97: 50.0 },
    { ageMonths: 144, p3: 25.0, p15: 29.5, p50: 36.5, p85: 44.5, p97: 56.0 },
    { ageMonths: 156, p3: 28.0, p15: 32.5, p50: 40.0, p85: 49.0, p97: 60.0 },
    { ageMonths: 168, p3: 32.0, p15: 36.5, p50: 44.0, p85: 53.0, p97: 65.0 },
    { ageMonths: 180, p3: 35.0, p15: 39.5, p50: 47.0, p85: 56.0, p97: 68.0 },
    { ageMonths: 192, p3: 38.0, p15: 42.0, p50: 50.0, p85: 58.0, p97: 72.0 },
    { ageMonths: 204, p3: 40.0, p15: 44.0, p50: 52.0, p85: 60.0, p97: 73.0 },
    { ageMonths: 216, p3: 42.0, p15: 46.0, p50: 54.0, p85: 62.0, p97: 75.0 },
  ],
};

// === HEIGHT/LENGTH (cm) by age in months ===
export const heightReference: GrowthReferenceSet = {
  male: [
    { ageMonths: 0, p3: 46.1, p15: 47.9, p50: 49.9, p85: 51.8, p97: 53.7 },
    { ageMonths: 1, p3: 50.8, p15: 52.3, p50: 54.7, p85: 56.7, p97: 58.6 },
    { ageMonths: 2, p3: 54.4, p15: 56.0, p50: 58.4, p85: 60.6, p97: 62.4 },
    { ageMonths: 3, p3: 57.3, p15: 59.0, p50: 61.4, p85: 63.5, p97: 65.5 },
    { ageMonths: 4, p3: 59.7, p15: 61.4, p50: 63.9, p85: 66.0, p97: 68.0 },
    { ageMonths: 5, p3: 61.7, p15: 63.4, p50: 65.9, p85: 68.0, p97: 70.1 },
    { ageMonths: 6, p3: 63.3, p15: 65.1, p50: 67.6, p85: 69.8, p97: 71.9 },
    { ageMonths: 9, p3: 67.5, p15: 69.4, p50: 72.0, p85: 74.2, p97: 76.5 },
    { ageMonths: 12, p3: 71.0, p15: 72.8, p50: 75.7, p85: 78.1, p97: 80.5 },
    { ageMonths: 15, p3: 73.6, p15: 76.0, p50: 79.1, p85: 81.7, p97: 84.2 },
    { ageMonths: 18, p3: 76.9, p15: 78.9, p50: 82.3, p85: 84.9, p97: 87.7 },
    { ageMonths: 24, p3: 81.7, p15: 84.1, p50: 87.8, p85: 90.9, p97: 93.9 },
    { ageMonths: 30, p3: 85.6, p15: 88.2, p50: 92.0, p85: 95.2, p97: 98.7 },
    { ageMonths: 36, p3: 88.7, p15: 91.5, p50: 96.1, p85: 99.8, p97: 103.5 },
    { ageMonths: 48, p3: 94.9, p15: 98.1, p50: 103.3, p85: 107.5, p97: 111.7 },
    { ageMonths: 60, p3: 100.7, p15: 104.2, p50: 110.0, p85: 114.6, p97: 119.2 },
    { ageMonths: 72, p3: 106.1, p15: 109.9, p50: 116.0, p85: 120.8, p97: 125.8 },
    { ageMonths: 84, p3: 111.2, p15: 115.0, p50: 121.7, p85: 126.5, p97: 131.3 },
    { ageMonths: 96, p3: 116.0, p15: 120.0, p50: 127.0, p85: 132.0, p97: 138.0 },
    { ageMonths: 108, p3: 120.5, p15: 124.5, p50: 132.0, p85: 137.5, p97: 143.5 },
    { ageMonths: 120, p3: 125.0, p15: 129.5, p50: 137.0, p85: 143.0, p97: 150.0 },
    { ageMonths: 132, p3: 129.0, p15: 134.0, p50: 142.0, p85: 149.0, p97: 156.0 },
    { ageMonths: 144, p3: 134.0, p15: 139.0, p50: 148.0, p85: 155.0, p97: 163.0 },
    { ageMonths: 156, p3: 139.0, p15: 144.5, p50: 155.0, p85: 162.0, p97: 170.0 },
    { ageMonths: 168, p3: 145.0, p15: 151.0, p50: 161.0, p85: 169.0, p97: 176.0 },
    { ageMonths: 180, p3: 150.0, p15: 156.0, p50: 166.0, p85: 174.0, p97: 181.0 },
    { ageMonths: 192, p3: 155.0, p15: 161.0, p50: 170.0, p85: 178.0, p97: 185.0 },
    { ageMonths: 204, p3: 158.0, p15: 164.0, p50: 173.0, p85: 180.0, p97: 187.0 },
    { ageMonths: 216, p3: 160.0, p15: 165.5, p50: 175.0, p85: 182.0, p97: 190.0 },
  ],
  female: [
    { ageMonths: 0, p3: 45.4, p15: 47.0, p50: 49.1, p85: 51.0, p97: 52.9 },
    { ageMonths: 1, p3: 49.8, p15: 51.2, p50: 53.7, p85: 55.6, p97: 57.6 },
    { ageMonths: 2, p3: 53.0, p15: 54.6, p50: 57.1, p85: 59.2, p97: 61.1 },
    { ageMonths: 3, p3: 55.6, p15: 57.2, p50: 59.8, p85: 62.0, p97: 64.0 },
    { ageMonths: 4, p3: 57.8, p15: 59.5, p50: 62.1, p85: 64.3, p97: 66.4 },
    { ageMonths: 5, p3: 59.6, p15: 61.4, p50: 64.0, p85: 66.2, p97: 68.5 },
    { ageMonths: 6, p3: 61.2, p15: 63.0, p50: 65.7, p85: 68.0, p97: 70.3 },
    { ageMonths: 9, p3: 65.3, p15: 67.2, p50: 70.1, p85: 72.6, p97: 75.0 },
    { ageMonths: 12, p3: 68.9, p15: 71.0, p50: 74.0, p85: 76.8, p97: 79.2 },
    { ageMonths: 15, p3: 72.0, p15: 74.0, p50: 77.5, p85: 80.2, p97: 83.0 },
    { ageMonths: 18, p3: 74.9, p15: 77.2, p50: 80.7, p85: 83.6, p97: 86.5 },
    { ageMonths: 24, p3: 80.0, p15: 82.5, p50: 86.4, p85: 89.6, p97: 92.9 },
    { ageMonths: 30, p3: 84.0, p15: 86.6, p50: 91.1, p85: 94.4, p97: 98.1 },
    { ageMonths: 36, p3: 87.4, p15: 90.3, p50: 95.1, p85: 98.9, p97: 102.7 },
    { ageMonths: 48, p3: 93.9, p15: 97.2, p50: 102.7, p85: 107.2, p97: 111.3 },
    { ageMonths: 60, p3: 99.9, p15: 103.6, p50: 109.4, p85: 114.2, p97: 118.9 },
    { ageMonths: 72, p3: 105.0, p15: 109.0, p50: 115.5, p85: 120.5, p97: 125.4 },
    { ageMonths: 84, p3: 110.0, p15: 114.5, p50: 121.0, p85: 126.5, p97: 131.5 },
    { ageMonths: 96, p3: 115.0, p15: 119.5, p50: 126.5, p85: 132.0, p97: 138.0 },
    { ageMonths: 108, p3: 120.0, p15: 124.5, p50: 132.0, p85: 138.0, p97: 144.0 },
    { ageMonths: 120, p3: 124.0, p15: 129.0, p50: 137.5, p85: 144.0, p97: 151.0 },
    { ageMonths: 132, p3: 129.0, p15: 134.0, p50: 143.0, p85: 150.0, p97: 157.0 },
    { ageMonths: 144, p3: 133.0, p15: 139.0, p50: 149.0, p85: 156.0, p97: 162.0 },
    { ageMonths: 156, p3: 138.0, p15: 144.0, p50: 153.0, p85: 160.0, p97: 166.0 },
    { ageMonths: 168, p3: 145.0, p15: 149.0, p50: 157.0, p85: 163.0, p97: 169.0 },
    { ageMonths: 180, p3: 148.0, p15: 152.0, p50: 159.5, p85: 165.0, p97: 171.0 },
    { ageMonths: 192, p3: 150.0, p15: 154.0, p50: 161.0, p85: 167.0, p97: 172.0 },
    { ageMonths: 204, p3: 151.0, p15: 155.0, p50: 162.0, p85: 168.0, p97: 173.0 },
    { ageMonths: 216, p3: 152.0, p15: 156.0, p50: 163.0, p85: 169.0, p97: 174.0 },
  ],
};

// === BMI (kg/m²) by age in months (5-19 years) ===
export const bmiReference: GrowthReferenceSet = {
  male: [
    { ageMonths: 24, p3: 13.4, p15: 14.2, p50: 15.7, p85: 17.0, p97: 18.4 },
    { ageMonths: 36, p3: 13.1, p15: 13.9, p50: 15.3, p85: 16.6, p97: 17.9 },
    { ageMonths: 48, p3: 12.9, p15: 13.7, p50: 15.2, p85: 16.6, p97: 18.0 },
    { ageMonths: 60, p3: 12.8, p15: 13.6, p50: 15.1, p85: 16.6, p97: 18.3 },
    { ageMonths: 72, p3: 12.8, p15: 13.6, p50: 15.2, p85: 16.9, p97: 18.8 },
    { ageMonths: 84, p3: 12.9, p15: 13.7, p50: 15.4, p85: 17.2, p97: 19.4 },
    { ageMonths: 96, p3: 13.1, p15: 13.9, p50: 15.7, p85: 17.8, p97: 20.3 },
    { ageMonths: 108, p3: 13.3, p15: 14.2, p50: 16.1, p85: 18.4, p97: 21.3 },
    { ageMonths: 120, p3: 13.6, p15: 14.6, p50: 16.6, p85: 19.2, p97: 22.5 },
    { ageMonths: 132, p3: 14.0, p15: 15.0, p50: 17.2, p85: 20.0, p97: 23.6 },
    { ageMonths: 144, p3: 14.5, p15: 15.5, p50: 17.8, p85: 20.9, p97: 24.8 },
    { ageMonths: 156, p3: 15.0, p15: 16.1, p50: 18.5, p85: 21.8, p97: 25.9 },
    { ageMonths: 168, p3: 15.5, p15: 16.7, p50: 19.2, p85: 22.6, p97: 26.8 },
    { ageMonths: 180, p3: 16.1, p15: 17.3, p50: 19.9, p85: 23.3, p97: 27.6 },
    { ageMonths: 192, p3: 16.6, p15: 17.9, p50: 20.5, p85: 24.0, p97: 28.2 },
    { ageMonths: 204, p3: 17.1, p15: 18.4, p50: 21.1, p85: 24.5, p97: 28.7 },
    { ageMonths: 216, p3: 17.5, p15: 18.8, p50: 21.7, p85: 25.0, p97: 29.1 },
  ],
  female: [
    { ageMonths: 24, p3: 13.2, p15: 14.0, p50: 15.4, p85: 16.8, p97: 18.2 },
    { ageMonths: 36, p3: 12.8, p15: 13.6, p50: 15.0, p85: 16.5, p97: 17.9 },
    { ageMonths: 48, p3: 12.7, p15: 13.4, p50: 14.9, p85: 16.5, p97: 18.2 },
    { ageMonths: 60, p3: 12.6, p15: 13.4, p50: 14.9, p85: 16.7, p97: 18.6 },
    { ageMonths: 72, p3: 12.6, p15: 13.4, p50: 15.1, p85: 17.0, p97: 19.2 },
    { ageMonths: 84, p3: 12.7, p15: 13.5, p50: 15.3, p85: 17.5, p97: 20.1 },
    { ageMonths: 96, p3: 12.9, p15: 13.8, p50: 15.7, p85: 18.2, p97: 21.1 },
    { ageMonths: 108, p3: 13.2, p15: 14.2, p50: 16.2, p85: 19.0, p97: 22.3 },
    { ageMonths: 120, p3: 13.5, p15: 14.6, p50: 16.8, p85: 19.8, p97: 23.5 },
    { ageMonths: 132, p3: 14.0, p15: 15.1, p50: 17.5, p85: 20.7, p97: 24.6 },
    { ageMonths: 144, p3: 14.5, p15: 15.7, p50: 18.2, p85: 21.5, p97: 25.6 },
    { ageMonths: 156, p3: 15.1, p15: 16.3, p50: 19.0, p85: 22.3, p97: 26.4 },
    { ageMonths: 168, p3: 15.6, p15: 16.9, p50: 19.6, p85: 23.0, p97: 27.1 },
    { ageMonths: 180, p3: 16.1, p15: 17.4, p50: 20.2, p85: 23.6, p97: 27.6 },
    { ageMonths: 192, p3: 16.4, p15: 17.8, p50: 20.7, p85: 24.0, p97: 28.0 },
    { ageMonths: 204, p3: 16.7, p15: 18.1, p50: 21.0, p85: 24.3, p97: 28.2 },
    { ageMonths: 216, p3: 16.9, p15: 18.3, p50: 21.3, p85: 24.5, p97: 28.4 },
  ],
};

/**
 * Interpolate reference values for a given age in months.
 * Uses linear interpolation between the two closest reference points.
 */
export function interpolateReference(
  ageMonths: number,
  data: GrowthReferencePoint[]
): GrowthReferencePoint | null {
  if (data.length === 0) return null;

  // Clamp to range
  if (ageMonths <= data[0].ageMonths) return data[0];
  if (ageMonths >= data[data.length - 1].ageMonths) return data[data.length - 1];

  // Find surrounding points
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
 * Generates points at every `stepMonths` interval from 0 to maxAge.
 */
export function buildReferenceCurve(
  refData: GrowthReferencePoint[],
  minAge: number,
  maxAge: number,
  stepMonths = 3
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
): { percentile: string; zone: "critical-low" | "low" | "normal" | "high" | "critical-high" } {
  if (value < ref.p3) return { percentile: "< P3", zone: "critical-low" };
  if (value < ref.p15) return { percentile: "P3-P15", zone: "low" };
  if (value <= ref.p85) return { percentile: "P15-P85", zone: "normal" };
  if (value <= ref.p97) return { percentile: "P85-P97", zone: "high" };
  return { percentile: "> P97", zone: "critical-high" };
}
