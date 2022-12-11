from csv import DictReader, DictWriter
from os.path import exists
from multiprocessing import Pool, cpu_count

from pdf2image import convert_from_path
import numpy as np

def parse(facility):
    print(facility[0])
    with open(f"./data/{facility[0]}.csv", "w") as csvfile:
        fieldnames = ["color", "count"]
        csv = DictWriter(csvfile, fieldnames=fieldnames)
        csv.writeheader()

        color_count = dict()
        images = convert_from_path(facility[1])
        for image in images:
            na = np.array(image)
            colors, counts = np.unique(
                na.reshape(-1, 3), axis=0, return_counts=1
            )
            colors = colors.tolist()
            counts = counts.tolist()
            for i in range(len(colors)):
                color = "-".join([str(c) for c in colors[i]])
                color_count[color] = color_count.get(color, 0) + int(counts[i])
        for color in color_count:
            csv.writerow({"color": color, "count": color_count[color]})



if __name__ == "__main__":
    with open("./inspections.csv") as file:
        reader = DictReader(file)
        pdfs = []
        for row in reader:
            pdf = f"./pdf/{row['FACILITY_ID']}.pdf"
            if exists(pdf):
                pdfs.append((row['FACILITY_ID'], pdf))
        with Pool(cpu_count()) as p:
            p.map(parse, pdfs)
