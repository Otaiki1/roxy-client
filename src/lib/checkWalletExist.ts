export const checkWalletExists = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if mnemonic exists in localStorage
    const mnemonic = localStorage.getItem("linera_mnemonic");
    if (mnemonic) {
      resolve(true);
      return;
    }

    // Also check IndexedDB for wallet data (Linera client stores wallet internally)
    try {
      const request = indexedDB.open("linera");

      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("ldb")) {
          resolve(false);
          db.close();
          return;
        }

        const transaction = db.transaction(["ldb"], "readonly");
        const objectStore = transaction.objectStore("ldb");
        const countRequest = objectStore.count();

        countRequest.onsuccess = () => {
          resolve(countRequest.result > 0);
          db.close();
        };

        countRequest.onerror = () => {
          resolve(false);
          db.close();
        };
      };

      request.onerror = () => {
        resolve(false);
      };

      request.onupgradeneeded = () => {
        // Database doesn't exist or needs upgrade
        resolve(false);
      };
    } catch (error) {
      // If IndexedDB is not available, just check localStorage
      resolve(false);
    }
  });
};

