/*
    Utils.java
    v1.0
    Created : 29/04/23
    Modified: 29/04/23
*/

package dp1soft.app.worker;

import dp1soft.app.logic.Genetic;
import dp1soft.app.model.*;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

public class Utils {
    public static Environment buildMap(int x, int y){
        Environment env = new Environment();
        Node node;
        int i, j;
        for(i=0; i < x+1; i++){
            for(j=0; j < y+1; j++){
                node = new Node();
                node.setX(i);
                node.setY(j);
                env.getMap().add(node);
            }
        }
        return env;
    }
    public static ArrayList<Pack> importPackages() throws FileNotFoundException {
        File inputDirectory;
        ArrayList<Pack> packages = new ArrayList<>();
        inputDirectory = new File(System.getProperty("user.dir") + "/backend/input/packages");
        String[] inputFiles = inputDirectory.list((dir, name) -> new File(dir, name).isFile());
        int j = 0;
        for (int i = 0; i < inputFiles.length; i++) {
            File file = new File(inputDirectory + "/" + inputFiles[i]);
            Scanner scan = new Scanner(file);
            while (scan.hasNextLine()) {
                String orderStr = scan.nextLine();
                String[] order = orderStr.split(",");
                int posX = Integer.parseInt(order[1]);
                int posY = Integer.parseInt(order[2]);
                int demand = Integer.parseInt(order[3]);
                String readyTime = order[0];
                String[] dateSections = readyTime.split(":");
                int startDate = Integer.parseInt(dateSections[0])*60 + Integer.parseInt(dateSections[1]);
                int dueDate = startDate + Integer.parseInt(order[5])*60;
                int idCustomer = Integer.parseInt(order[4]);
                Pack pack = new Pack(idCustomer, j, startDate, dueDate, posX, posY, demand);
                packages.add(pack);
                j++;
            }
            scan.close();
        }
        return packages;
    }
    public static ArrayList<Vehicle> importVehicles() throws FileNotFoundException {
        File inputDirectory;
        ArrayList<Vehicle> vehicles = new ArrayList<>();
        inputDirectory = new File(System.getProperty("user.dir") + "/backend/input/vehicles");
        String[] inputFiles = inputDirectory.list((dir, name) -> new File(dir, name).isFile());
        for (int i = 0; i < inputFiles.length; i++) {
            File file = new File(inputDirectory + "/" + inputFiles[i]);
            Scanner scan = new Scanner(file);
            while (scan.hasNextLine()) {
                String vehicleStr = scan.nextLine();
                String[] v = vehicleStr.split(",");
                Vehicle vehicle = new Vehicle(v[3]);
                vehicle.setId(Integer.parseInt(v[0]));
                vehicles.add(vehicle);
            }
            scan.close();
        }
        return vehicles;
    }
    public static ArrayList<Blockage> importBlockages() throws FileNotFoundException {
        File inputDirectory;
        ArrayList<Blockage> blockages = new ArrayList<>();
        inputDirectory = new File(System.getProperty("user.dir") + "/backend/input/blockages");
        String[] inputFiles = inputDirectory.list((dir, name) -> new File(dir, name).isFile());
        int k = 0;
        for (int i = 0; i < inputFiles.length; i++) {
            File file = new File(inputDirectory + "/" + inputFiles[i]);
            Scanner scan = new Scanner(file);
            while (scan.hasNextLine()) {
                String blockStr = scan.nextLine();
                String[] b = blockStr.split(",");
                String[] start = b[0].split("-")[0].split(":");
                String[] end = b[0].split("-")[1].split(":");
                int tStart = (Integer.parseInt(start[0]) - 1) * Worker.DAY + Integer.parseInt(start[1]) * 60 + Integer.parseInt(start[2]);
                int tEnd = (Integer.parseInt(end[0]) - 1) * Worker.DAY + Integer.parseInt(end[1]) * 60 + Integer.parseInt(end[2]);
                for (int j = 1; j < b.length-1; j+=2) {
                    Blockage blockage = new Blockage(k, tStart, tEnd, Integer.parseInt(b[j]), Integer.parseInt(b[j+1]));
                    blockages.add(blockage);
                    k++;
                }
            }
            scan.close();
        }
        return blockages;
    }
    public static ArrayList<Integer> importFaults() throws FileNotFoundException {
        File inputDirectory;
        ArrayList<Integer> faults = new ArrayList<>();
        inputDirectory = new File(System.getProperty("user.dir") + "/backend/input/faults");
        String[] inputFiles = inputDirectory.list((dir, name) -> new File(dir, name).isFile());
        for (int i = 0; i < inputFiles.length; i++) {
            File file = new File(inputDirectory + "/" + inputFiles[i]);
            Scanner scan = new Scanner(file);
            while (scan.hasNextLine()) {
                String blockStr = scan.nextLine();
                String[] b = blockStr.split(",");
                String[] start = b[0].split("-")[0].split(":");
                String type = b[1];
                int tStart = Integer.parseInt(start[0]) * 60 + Integer.parseInt(start[1]);
                faults.add(tStart);
                faults.add(Integer.parseInt(type));
            }
            scan.close();
        }
        return faults;
    }
    public static void buyVehicles(ArrayList<Vehicle> vehicles){
        for(Vehicle v: vehicles){
            switch (v.getState()){
                case 4: v.setState(5); break;
                case 5: v.setState(0); break;
            }
        }
    }
    public static String timeString(int minutes) {
        return String.format("%02d", (minutes/60) % 24) + ":" + String.format("%02d", minutes % 60);
    }
    public static void checkBlockage(Environment env, ArrayList<Vehicle> vehicles){
        boolean update = false;
        int i;
        for(i = 0; i < env.getBlockList().size(); i++){
            if(env.getBlockList().get(i).getStart() == env.getTime()){
                System.out.println("Empezó el bloqueo " + env.getBlockList().get(i).getId());
                toggleNode(env.getMap(), env.getBlockList().get(i).getNode());
                update = true;
            }
            if(env.getBlockList().get(i).getEnd() == env.getTime()){
                System.out.println("Terminó el bloqueo " + env.getBlockList().get(i).getId());
                toggleNode(env.getMap(), env.getBlockList().get(i).getNode());
                env.getBlockList().remove(i);
                i--;
                update = true;
            }
        }
        if(update){
            restartAll(env, vehicles);
        }
    }
    private static void toggleNode(ArrayList<Node> map, Node block){
        for(Node n : map){
            if(n.equals(block)){
                n.setBlocked(!n.isBlocked());
                break;
            }
        }
    }
    private static void restartAll(Environment env, ArrayList<Vehicle> vehicles){
        ArrayList<Vehicle> newVehicles;
        for(Blockage b : env.getBlockList()){
            if(b.getStart() <= env.getTime()){
                for(Vehicle v : vehicles){
                    if(v.getState() == 1 || v.getState() == 2){
                        for(int i = v.getStep(); i < v.getRoute().getChroms().size(); i++){
                            if(v.getRoute().getChroms().get(i).equals(b.getNode())){
                                newVehicles = new ArrayList<>();
                                newVehicles.add(v);
                                v.setRoute(Genetic.getBestRoute(env, newVehicles, v.getPack(), env.getTime()));
                                v.setStep(0);
                                System.out.println("Se replanificó la ruta del " + v.getType() + " #" + v.getId());
                                break;
                            }
                        }
                    }
                }
            }else {
                break;
            }
        }
    }
    public static void repairVehicle(ArrayList<Vehicle> vehicles){
        for(Vehicle v : vehicles){
            if(v.getState() == 3){
                v.setState(0);
            }
        }
    }
    public static void killVehicle(Environment env, ArrayList<Pack> packages, ArrayList<Vehicle> vehicles, int type){
        int iPack;
        for(Vehicle v : vehicles){
            if(v.getState() == 1){
                v.getLocation().setX(45);
                v.getLocation().setY(30);
                iPack = findPackage(packages, v.getPack().getId());
                if(iPack == -1){
                    System.out.println("Error, no hay paquete");
                    System.exit(0);
                }
                packages.get(iPack).setUnassigned(packages.get(iPack).getUnassigned() + v.getCarry());
                packages.get(iPack).setTime(env.getTime());
                v.setState(type);
                v.setPack(null);
                v.setRoute(null);
                v.setStep(0);
                v.setMoved(false);
                System.out.println(v.getType() + " #" + v.getId() + " averiado, reasignando el Pedido #" + packages.get(iPack).getIdCustomer());
                break;
            }
        }
    }
    private static int findPackage(ArrayList<Pack> packages, int id){
        int index = -1;
        for(Pack p : packages){
            index++;
            if(p.getId() == id){
                break;
            }
        }
        if(index == packages.size()){
            index = -1;
        }
        return index;
    }
    public static ArrayList<Integer> checkPackage(ArrayList<Pack> packages, int minutes){
        ArrayList<Integer> list = new ArrayList<>();
        int i = 0;
        for(Pack p : packages){
            if(p.getTime() <= minutes && p.getUnassigned() > 0){
                list.add(i);
            }
            i++;
        }
        return list;
    }
    public static void moveVehicles(Environment env, ArrayList<Vehicle> vehicles, ArrayList<Pack> packages){
        ArrayList<Vehicle> newVehicles;
        String state = "";
        Pack p;
        int iPack;
        for(Vehicle v : vehicles){
            if(v.getState() == 1 || v.getState() == 2) {
                if(v.getType().equals("Auto") && !v.isMoved()){
                    v.setMoved(true);
                    continue;
                }
                v.setMoved(false);
                if(v.getStep() < v.getRoute().getChroms().size()){
                    switch (v.getState()) {
                        case 1 -> state = "ENTREGANDO #" + v.getPack().getIdCustomer();
                        case 2 -> state = "REGRESANDO";
                    }
                    v.setLocation(v.getRoute().getChroms().get(v.getStep()).getTo());
                    System.out.println(v.getType() + " #" + v.getId() + ": (" +
                            v.getRoute().getChroms().get(v.getStep()).getFrom().getX() + ", " +
                            v.getRoute().getChroms().get(v.getStep()).getFrom().getX() + ") se fue a (" +
                            v.getLocation().getX() + ", " + v.getLocation().getY() + ") - " + state);
                    v.setStep(v.getStep() + 1);
                    if(v.getStep() == v.getRoute().getChroms().size()){
                        System.out.println(v.getType() + " #" + v.getId() + ": Llegó a su destino");
                        iPack = findPackage(packages, v.getPack().getId());
                        packages.get(iPack).setFullfilled(packages.get(iPack).getFullfilled() + v.getCarry());
                        if(packages.get(iPack).getFullfilled() >= v.getPack().getDemand() && v.getState() == 1){
                            //times.add(packages.get(iPack).deadline - env.time);
                            System.out.println("Pedido #" + packages.get(iPack).getIdCustomer() + " completado");
                            packages.remove(iPack);
                        }
                        v.setCarry(0);
                        if(v.getState() == 1){
                            p = new Pack();
                            p.setId(-1);
                            p.setIdCustomer(-1);
                            p.getLocation().setX(45);
                            p.getLocation().setY(30);
                            p.setDeadline(Integer.MAX_VALUE);
                            v.setPack(p);
                            newVehicles = new ArrayList<>();
                            newVehicles.add(v);
                            v.setRoute(Genetic.getBestRoute(env, newVehicles, p, env.getTime()));
                            v.setState(2);
                            v.setStep(0);
                            v.setMoved(false);
                        }else {
                            v.setRoute(null);
                            v.setPack(null);
                            v.setState(0);
                            v.setMoved(false);
                        }
                    }
                }
            }
        }
    }
}
