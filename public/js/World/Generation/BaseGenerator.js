// BaseGenerator.js
export class BaseGenerator {
    constructor() {
      if (new.target === BaseGenerator) {
        throw new Error("Cannot instantiate abstract class BaseGenerator directly");
      }
    }
    getRandomIndex(probabilities) {
      // Generate a random number between 0 and 1
      const randomValue = Math.random();
    
      // Create a cumulative sum of probabilities
      let cumulativeSum = 0;
    
      // Iterate over the array of probabilities
      for (let i = 0; i < probabilities.length; i++) {
        cumulativeSum += probabilities[i];
    
        // Return the index if the random value is within the current cumulative sum range
        if (randomValue < cumulativeSum) {
          return i;
        }
      }
    
      // In case of rounding errors, return the last index as a fallback
      return probabilities.length - 1;
    }
    // Abstract method
    generateTile(pseudoTile) {
      throw new Error("Method 'generateTile(pseudoTile)' must be implemented");
    }
  }
  