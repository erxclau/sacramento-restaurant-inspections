from urllib.request import urlretrieve
from csv import DictReader
from multiprocessing import Pool, cpu_count


def download(facility):
    print(facility[1])
    urlretrieve(facility[0], f"./pdf/{facility[1]}.pdf")


if __name__ == "__main__":
    with open("./data.csv", "r") as f:
        reader = DictReader(f)
        urls = []
        for row in reader:
            if len(row["LINK"]) > 0:
                urls.append((row["LINK"], row["FACILITY_ID"]))
        with Pool(cpu_count()) as p:
            p.map(download, urls)
